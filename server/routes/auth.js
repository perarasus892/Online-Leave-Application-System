import express from 'express';
import { Otp } from '../models/Otp.js';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/send-otp', async (req, res) => {
    const { userId, mobileNumber } = req.body;
    if (!userId || !mobileNumber) {
        return res.status(400).json({ success: false, error: 'User ID and mobile number are required' });
    }

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ success: false, error: "User ID not found. Please contact the College Admin." });
        }

        if (user.mobileNumber !== mobileNumber) {
            return res.status(400).json({ success: false, error: 'Mobile number does not match our records' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate(
            { userId },
            {
                otp,
                mobileNumber,
                expiresAt: Date.now() + 5 * 60 * 1000,
                attempts: 0
            },
            { upsert: true }
        );

        console.log(`OTP generated for user ${userId}: ${otp}`);
        res.json({ success: true, otp, expiresIn: 300 });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to send OTP. Database error.' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, error: 'User ID and OTP are required' });
    }

    try {
        const otpData = await Otp.findOne({ userId });
        if (!otpData) {
            return res.status(404).json({ success: false, error: 'OTP not found or expired' });
        }

        if (Date.now() > otpData.expiresAt) {
            await Otp.deleteOne({ userId });
            return res.status(400).json({ success: false, error: 'OTP has expired' });
        }

        if (otpData.attempts >= 3) {
            await Otp.deleteOne({ userId });
            return res.status(400).json({ success: false, error: 'Maximum OTP verification attempts exceeded' });
        }

        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            await otpData.save();
            return res.status(400).json({ success: false, error: `Invalid OTP. ${3 - otpData.attempts} attempts remaining` });
        }

        const user = await User.findOne({ userId });
        const sessionToken = crypto.randomUUID();

        await Session.create({
            token: sessionToken,
            userId,
            role: user.role,
            name: user.name,
            email: user.email,
            department: user.department,
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        await Otp.deleteOne({ userId });

        res.json({
            success: true,
            token: sessionToken,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to verify OTP. Database error.' });
    }
});

router.post('/logout', async (req, res) => {
    const { token } = req.body;
    try {
        await Session.deleteOne({ token });
        res.json({ success: true });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false });
    }
});

export default router;
