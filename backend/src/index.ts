import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search';
import streamRoutes from './routes/stream';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes for both local dev and Vercel serverless functions
app.use('/api/search', searchRoutes);
app.use('/search', searchRoutes);

app.use('/api/stream', streamRoutes);
app.use('/stream', streamRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'White Music' }));
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'White Music' }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
}

export default app;