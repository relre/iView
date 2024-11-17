import { Router } from 'express';
import { createProxyServer } from 'http-proxy';

const router = Router();
const proxy = createProxyServer();

router.get('/', (req, res) => {
  const videoUrl = req.query.url as string;
  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  proxy.web(req, res, { target: videoUrl, changeOrigin: true }, (err) => {
    console.error('Error fetching video:', err.message);
    res.status(500).json({ error: 'Failed to fetch video', details: err.message });
  });
});

export default router;