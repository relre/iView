import express from 'express';
import request from 'request';

const app = express();

app.get('/proxy', (req, res) => {
  const videoUrl = req.query.url as string;
  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }
  request(videoUrl).pipe(res).on('error', (err) => {
    console.error('Error fetching video:', err.message);
    res.status(500).json({ error: 'Failed to fetch video', details: err.message });
  });
});

export default app;