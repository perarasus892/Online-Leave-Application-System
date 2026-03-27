import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    createdAt: { type: Number, required: true },
    expiresAt: { type: Number, required: true }
});

export const Session = mongoose.model('Session', sessionSchema);
