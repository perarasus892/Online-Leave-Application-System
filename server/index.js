import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import leaveRoutes from './routes/leaves.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('LeaveTrack API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
