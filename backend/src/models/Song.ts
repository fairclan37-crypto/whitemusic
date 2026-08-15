import mongoose from 'mongoose';

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: String,
  genre: String,
  cover: String,
  audioUrl: { type: String, required: true },
  duration: Number,
  category: { type: String, enum: ['bollywood', 'hollywood', 'indie', 'pop'], default: 'pop' },
  plays: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Song', SongSchema);