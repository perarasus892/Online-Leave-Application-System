import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    expiresAt: { type: Number, required: true },
    attempts: { type: Number, default: 0 }
});

export const Otp = mongoose.model('Otp', otpSchema);
