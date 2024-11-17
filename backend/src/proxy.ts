import express from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const app = express();

app.use('/proxy', (req, res, next) => {
  const videoUrl = req.query.url as string;
  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }
  const proxyOptions: Options = {
    target: videoUrl,
    changeOrigin: true,
    onError: (err: Error, _req: express.Request, res: express.Response) => {
      console.error('Error fetching video:', err.message);
      res.status(500).json({ error: 'Failed to fetch video', details: err.message });
    }
  };
  createProxyMiddleware(proxyOptions)(req, res, next);
});

export default app;