import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search';
import streamRoutes from './routes/stream'; // ✅ यह लाइन रहेगी

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/search', searchRoutes);
app.use('/api/stream', streamRoutes); // ✅ यह रूट रहेगा

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));