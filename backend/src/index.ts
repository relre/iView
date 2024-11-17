import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import questionPackageRoutes from './routes/questionPackageRoutes';
import authRoutes from './routes/authRoutes';
import interviewRoutes from './routes/interviewRoutes';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { Blob } from 'buffer';
import proxyRouter from './proxy';




dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;

app.use(cors({
  origin: 'https://iview.relre.dev',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json({ limit: '140mb' }));
app.use(express.urlencoded({ limit: '140mb', extended: true }));

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('VIDEO_API_PROJECT:', process.env.VIDEO_API_PROJECT);
console.log('VIDEO_API_BUCKET:', process.env.VIDEO_API_BUCKET);
console.log('VIDEO_API_KEY:', process.env.VIDEO_API_KEY);
console.log('VIDEO_API_LINK:', process.env.VIDEO_API_LINK);

console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI!, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
  console.log(process.env.MONGO_URI);
app.use('/api', questionPackageRoutes);
app.use('/api', interviewRoutes);
app.use('/api/auth', authRoutes);


app.use('/proxy', proxyRouter);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

app.post('/api/upload', upload.single('file'), async (req: MulterRequest, res: Response) => {
  // CORS başlıklarını ekleyin
  res.header('Access-Control-Allow-Origin', 'https://iview.relre.dev');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('project', process.env.VIDEO_API_PROJECT!);
    formData.append('bucket', process.env.VIDEO_API_BUCKET!);
    formData.append('accessKey', process.env.VIDEO_API_KEY!);
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', req.file.buffer, req.file.originalname);

    const response = await axios.post(`${process.env.VIDEO_API_LINK}`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    res.json({ url: response.data.url });
  } catch (error) {
    const err = error as any;
    console.error('Error uploading video:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to upload video', details: err.response ? err.response.data : err.message });
  }
});

app.get('/api/video/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const response = await axios.get(`${process.env.VIDEO_API_LINK}/${process.env.VIDEO_API_PROJECT}/${process.env.VIDEO_API_BUCKET}/${process.env.VIDEO_API_KEY}${videoId}`);
    res.send(response.data);
  } catch (error) {
    const err = error as any;
    console.error('Error fetching video:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to fetch video', details: err.response ? err.response.data : err.message });
  }
});

app.get('/', (req, res) => {
  res.send('HR App Backend');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});