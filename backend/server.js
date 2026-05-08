const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

function corsOrigin(origin, callback) {
  // Allow requests with no origin (mobile apps, curl, Postman)
  if (!origin) return callback(null, true);
  // Allow any vercel.app subdomain
  if (origin.endsWith('.vercel.app')) return callback(null, true);
  // Allow explicitly listed origins
  if (allowedOrigins.includes(origin)) return callback(null, true);
  callback(new Error(`CORS blocked: ${origin}`));
}

app.options('*', cors({ origin: corsOrigin, credentials: true }));
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(cookieParser());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spaced-repetition';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/concepts', require('./routes/concepts'));

app.get('/', (req, res) => res.json({ status: 'ok', message: 'StudyTracker API running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
