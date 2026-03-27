import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;

export const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        if (!uri) {
            // No external MongoDB configured — use an in-memory MongoDB
            console.log('No MONGODB_URI found, starting in-memory MongoDB...');
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log(`In-memory MongoDB started at: ${uri}`);
        }

        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
        
        // Auto-seed initial admin if the database is empty
        const User = mongoose.model('User');
        const LeaveBalance = mongoose.model('LeaveBalance');
        
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding 10+ demo users for 4-tier system...');
            
            const initialUsers = [
                // College Admin
                { userId: "ADMIN", name: "College Administrator", mobileNumber: "0000000000", role: "Admin", department: "Administration" },
                
                // Computer Science Dept
                { userId: "HOD-CS", name: "Dr. Srinivasan", mobileNumber: "1111111111", role: "HOD", department: "BSc Computer Science" },
                { userId: "STAFF-CS", name: "Prof. Anitha", mobileNumber: "2222222222", role: "Staff", department: "BSc Computer Science" },
                { userId: "STU-CS-01", name: "Rajesh Kumar", mobileNumber: "3333333333", role: "Student", department: "BSc Computer Science" },
                { userId: "STU-CS-02", name: "Priya Dharshini", mobileNumber: "4444444444", role: "Student", department: "BSc Computer Science" },

                // Physics Dept
                { userId: "HOD-PHY", name: "Dr. Murali Krishna", mobileNumber: "5555555555", role: "HOD", department: "BSc Physics" },
                { userId: "STAFF-PHY", name: "Prof. Vikram", mobileNumber: "6666666666", role: "Staff", department: "BSc Physics" },
                { userId: "STU-PHY-01", name: "Suresh Raina", mobileNumber: "7777777777", role: "Student", department: "BSc Physics" },

                // Commerce Dept
                { userId: "HOD-COM", name: "Dr. Lakshmi", mobileNumber: "8888888888", role: "HOD", department: "BCom Commerce" },
                { userId: "STAFF-COM", name: "Prof. Karthik", mobileNumber: "9999999999", role: "Staff", department: "BCom Commerce" },
                { userId: "STU-COM-01", name: "Meera Jasmine", mobileNumber: "9000000001", role: "Student", department: "BCom Commerce" },

                // Mathematics Dept
                { userId: "HOD-MAT", name: "Dr. Ramanujan", mobileNumber: "9000000002", role: "HOD", department: "BSc Mathematics" },
                { userId: "STU-MAT-01", name: "Gokul Nath", mobileNumber: "9000000003", role: "Student", department: "BSc Mathematics" }
            ];

            for (const userData of initialUsers) {
                const user = await User.create({
                    ...userData,
                    email: userData.userId.toLowerCase() + "@dgvaishnav.edu.in",
                    designation: userData.role === "HOD" ? "Department Head" : userData.role === "Staff" ? "Assistant Professor" : "Student",
                    joiningDate: new Date().toISOString().split('T')[0],
                });
                await LeaveBalance.create({ userId: user.userId });
            }
            console.log('14 demo users seeded successfully.');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const stopDB = async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
};
