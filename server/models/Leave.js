import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    leaveId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    department: { type: String, required: true },
    leaveType: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    duration: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // Pending Staff, Pending HOD, Approved, Rejected
    appliedOn: { type: String, required: true },
    verifiedBy: { type: String, default: null },
    verifiedOn: { type: String, default: null },
    verifiedComments: { type: String, default: null },
    approvedBy: { type: String, default: null },
    approvedOn: { type: String, default: null },
    comments: { type: String, default: null }
});

export const Leave = mongoose.model('Leave', leaveSchema);
