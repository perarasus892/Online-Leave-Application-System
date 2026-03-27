import express from 'express';
import { Leave } from '../models/Leave.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

const router = express.Router();

const getSession = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const session = await Session.findOne({ token });
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
        await Session.deleteOne({ token });
        return null;
    }
    return session;
};

router.get('/balance', async (req, res) => {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
        let balance = await LeaveBalance.findOne({ userId: session.userId });
        if (!balance) {
            balance = await LeaveBalance.create({ userId: session.userId });
        }
        res.json({ success: true, balance });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch leave balance' });
    }
});

router.post('/apply', async (req, res) => {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { leaveType, startDate, endDate, duration, reason } = req.body;
    const leaveId = `LEAVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        await Leave.create({
            leaveId,
            userId: session.userId,
            userName: session.name,
            department: req.body.department || session.department,
            leaveType,
            startDate,
            endDate,
            duration: parseFloat(duration),
            reason,
            appliedOn: new Date().toISOString(),
        });
        res.json({ success: true, leaveId });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to submit leave application' });
    }
});

router.get('/my', async (req, res) => {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
        const leaves = await Leave.find({ userId: session.userId }).sort({ appliedOn: -1 });
        res.json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch leave history' });
    }
});

router.get('/all', async (req, res) => {
    const session = await getSession(req);
    if (!session || (session.role === 'Student')) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    try {
        let query = {};
        
        if (session.role === 'Staff') {
            // Staff see Student leaves in their department that are Pending
            const studentsInDept = await User.find({ department: session.department, role: 'Student' });
            const studentIds = studentsInDept.map(s => s.userId);
            query = { userId: { $in: studentIds }, status: 'Pending' };
        } 
        else if (session.role === 'HOD') {
            // HOD see Staff leaves (Pending) OR Student leaves (Verified) in their department
            const staffInDept = await User.find({ department: session.department, role: 'Staff' });
            const studentsInDept = await User.find({ department: session.department, role: 'Student' });
            
            const staffIds = staffInDept.map(s => s.userId);
            const studentIds = studentsInDept.map(s => s.userId);
            
            query = {
                $or: [
                    { userId: { $in: staffIds }, status: 'Pending' },
                    { userId: { $in: studentIds }, status: 'Verified' }
                ]
            };
        }
        else if (session.role === 'Admin') {
            // Admin see HOD leaves that are Pending system-wide
            const hods = await User.find({ role: 'HOD' });
            const hodIds = hods.map(h => h.userId);
            query = { userId: { $in: hodIds }, status: 'Pending' };
        }

        const leaves = await Leave.find(query).sort({ appliedOn: -1 });
        res.json({ success: true, leaves });
    } catch (error) {
        console.error("Fetch all error:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch leave requests' });
    }
});

router.get('/statistics', async (req, res) => {
    const session = await getSession(req);
    if (!session || (session.role === 'Student')) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    try {
        let query = {};
        if (session.role === 'HOD' || session.role === 'Staff') {
            query = { department: session.department };
        }

        const leaves = await Leave.find(query);
        const statistics = {
            total: leaves.length,
            pending: leaves.filter(l => l.status === 'Pending' || l.status === 'Verified').length,
            approved: leaves.filter(l => l.status === 'Approved').length,
            rejected: leaves.filter(l => l.status === 'Rejected').length,
            byType: {},
            byDepartment: {},
        };

        leaves.forEach(leave => {
            statistics.byType[leave.leaveType] = (statistics.byType[leave.leaveType] || 0) + 1;
            statistics.byDepartment[leave.department] = (statistics.byDepartment[leave.department] || 0) + 1;
        });

        res.json({ success: true, statistics });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

router.post('/review', async (req, res) => {
    const session = await getSession(req);
    if (!session || session.role === 'Student') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { leaveId, action, comments } = req.body;
    try {
        const leave = await Leave.findOne({ leaveId });
        if (!leave) return res.status(404).json({ success: false, error: 'Leave request not found' });
        
        const applicant = await User.findOne({ userId: leave.userId });
        if (!applicant) return res.status(404).json({ success: false, error: 'Applicant not found' });

        if (action === 'Rejected') {
            leave.status = 'Rejected';
            leave.comments = comments || 'Rejected';
            await leave.save();
            return res.json({ success: true });
        }

        // Logic for Verification (Staff) or Approval (HOD/Admin)
        if (session.role === 'Staff' && applicant.role === 'Student') {
            if (leave.status !== 'Pending') return res.status(400).json({ success: false, error: 'Already verified' });
            leave.status = 'Verified';
            leave.verifiedBy = session.name;
            leave.verifiedOn = new Date().toISOString();
            leave.verifiedComments = comments || 'Verified by Staff';
        } 
        else if (session.role === 'HOD') {
            if (applicant.role === 'Staff') {
                if (leave.status !== 'Pending') return res.status(400).json({ success: false, error: 'Already reviewed' });
                leave.status = 'Approved';
            } else if (applicant.role === 'Student') {
                if (leave.status !== 'Verified') return res.status(400).json({ success: false, error: 'Must be verified by Staff first' });
                leave.status = 'Approved';
            } else {
                return res.status(403).json({ success: false, error: 'HOD cannot approve this role' });
            }
            leave.approvedBy = session.name;
            leave.approvedOn = new Date().toISOString();
            leave.comments = comments || 'Approved by HOD';
        }
        else if (session.role === 'Admin' && applicant.role === 'HOD') {
            if (leave.status !== 'Pending') return res.status(400).json({ success: false, error: 'Already reviewed' });
            leave.status = 'Approved';
            leave.approvedBy = session.name;
            leave.approvedOn = new Date().toISOString();
            leave.comments = comments || 'Approved by College Admin';
        } else {
            return res.status(403).json({ success: false, error: 'You do not have permission to review this request at this stage' });
        }

        await leave.save();

        if (leave.status === 'Approved') {
            const balance = await LeaveBalance.findOne({ userId: leave.userId });
            if (balance) {
                const typeMap = {
                    'Casual Leave': 'casual',
                    'Sick Leave': 'sick',
                    'Earned Leave': 'earned',
                    'Unpaid Leave': 'unpaid',
                };
                const field = typeMap[leave.leaveType];
                if (field && balance[field] !== undefined) {
                    balance[field] = Math.max(0, balance[field] - leave.duration);
                    await balance.save();
                }
            }
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Review error:", error);
        res.status(500).json({ success: false, error: 'Failed to review leave request' });
    }
});

export default router;
