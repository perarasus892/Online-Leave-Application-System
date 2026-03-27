import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    mobileNumber: { type: String, required: true },
    role: { type: String, required: true, enum: ['Student', 'Staff', 'HOD', 'Admin'] },
    department: { type: String, required: true },
    designation: { type: String },
    joiningDate: { type: String }
});

export const User = mongoose.model('User', userSchema);
