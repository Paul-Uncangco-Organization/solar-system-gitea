// app.js
import 'dotenv/config';                 // 1. Load .env FIRST
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ---------- DB ----------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined. Check your .env file.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI, {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✅ MongoDB Connection Successful');
} catch (err) {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
}

// ---------- Schema ----------
const dataSchema = new mongoose.Schema(
  {
    name:        String,
    id:          Number,
    description: String,
    image:       String,
    velocity:    String,
    distance:    String,
  },
  { collection: 'planets' }
);

const Planet = mongoose.model('Planet', dataSchema);

// ---------- Routes ----------
app.post('/planet', async (req, res) => {
  try {
    const planet = await Planet.findOne({ id: req.body.id }).lean();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    res.json(planet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching planet data' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api-docs', async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'oas.json'), 'utf8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Error reading oas.json:', err);
    res.status(500).json({ error: 'Error reading API docs' });
  }
});

app.get('/os', (req, res) => {
  res.json({ os: os.hostname(), env: process.env.NODE_ENV ?? 'development' });
});

app.get('/live',  (_req, res) => res.json({ status: 'live' }));
app.get('/ready', (_req, res) => res.json({ status: 'ready' }));

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;