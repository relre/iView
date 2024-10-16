import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import questionPackageRoutes from './routes/questionPackageRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI!, { })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api', questionPackageRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('HR App Backend');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});