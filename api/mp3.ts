import yt from '@vreden/youtube_scraper';

// Vercel Serverless Function (Node runtime)
// GET /api/mp3?id=VIDEO_ID&q=320
export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const id = typeof req.query?.id === 'string' ? req.query.id : '';
  const qRaw = typeof req.query?.q === 'string' ? req.query.q : '320';
  const quality = Number(qRaw);

  if (!id) {
    res.status(400).json({ status: false, error: 'missing id' });
    return;
  }

  const allowed = [92, 128, 256, 320] as const;
  if (!allowed.includes(quality as any)) {
    res.status(400).json({ status: false, error: 'invalid quality', allowed });
    return;
  }

  try {
    const result: any = await yt.ytmp3(`https://www.youtube.com/watch?v=${id}`, quality);

    res.status(200).json({
      status: true,
      id,
      metadata: {
        title: result?.metadata?.title,
        author: result?.metadata?.author?.name,
        seconds: result?.metadata?.seconds,
        thumbnail: result?.metadata?.thumbnail,
      },
      download: {
        quality: result?.download?.quality,
        url: result?.download?.url,
        filename: result?.download?.filename,
      },
    });
  } catch (e: any) {
    res.status(502).json({ status: false, error: 'ytmp3_failed', message: String(e?.message || e) });
  }
}
