import express from 'express';
import { User } from '../models/User.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Leave } from '../models/Leave.js';
import { Otp } from '../models/Otp.js';
import { Session } from '../models/Session.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

router.post('/', async (req, res) => {
    const data = req.body;
    try {
        const existing = await User.findOne({ userId: data.userId });
        if (existing) return res.status(400).json({ success: false, error: 'User ID already exists' });

        const user = await User.create({
            ...data,
            joiningDate: new Date().toISOString().split('T')[0],
        });
        await LeaveBalance.create({ userId: user.userId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create user' });
    }
});

router.delete('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await User.deleteOne({ userId });
        await LeaveBalance.deleteOne({ userId });
        await Leave.deleteMany({ userId });
        await Otp.deleteMany({ userId });
        await Session.deleteMany({ userId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
});

router.post('/reinitialize', async (req, res) => {
    try {
        await User.deleteMany({});
        await LeaveBalance.deleteMany({});
        await Leave.deleteMany({});
        await Otp.deleteMany({});
        await Session.deleteMany({});

        const initialUsers = [
            {
                userId: "ADMIN",
                name: "College Administrator",
                email: "admin@dgvaishnav.edu.in",
                mobileNumber: "0000000000",
                role: "Admin",
                department: "Administration",
                designation: "System Admin",
                joiningDate: new Date().toISOString().split('T')[0],
            }
        ];

        for (const u of initialUsers) {
            await User.create(u);
            await LeaveBalance.create({ userId: u.userId });
        }

        res.json({
            success: true,
            users: initialUsers.map(u => ({ userId: u.userId, name: u.name, role: u.role, mobile: u.mobileNumber }))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reinitialize data' });
    }
});

export default router;
