import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    casual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    unpaid: { type: Number, default: 0 }
});

export const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
