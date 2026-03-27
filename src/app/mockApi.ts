// MongoDB API Client - replaces localStorage implementation
// All data is stored in and retrieved from the MongoDB backend via Express

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('sessionToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ==================== AUTH ====================

export async function sendOtp(
    userId: string,
    mobileNumber: string
): Promise<{ success: boolean; otp?: string; expiresIn?: number; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, mobileNumber }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, error: "Failed to send OTP. Server error." };
    }
}

export async function verifyOtp(
    userId: string,
    otp: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, otp }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, error: "Failed to verify OTP. Server error." };
    }
}

export async function logout(token: string): Promise<void> {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

// ==================== USER ====================

export async function getLeaveBalance(
    token: string
): Promise<{ success: boolean; balance?: any; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/leaves/balance`, {
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching leave balance:", error);
        return { success: false, error: "Failed to fetch leave balance" };
    }
}

// ==================== LEAVES ====================

export async function applyLeave(
    token: string,
    data: { leaveType: string; startDate: string; endDate: string; duration: string; reason: string; department?: string }
): Promise<{ success: boolean; leaveId?: string; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/leaves/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error("Error applying for leave:", error);
        return { success: false, error: "Failed to submit leave application" };
    }
}

export async function getMyLeaves(
    token: string
): Promise<{ success: boolean; leaves?: any[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/leaves/my`, {
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching leaves:", error);
        return { success: false, error: "Failed to fetch leave history" };
    }
}

export async function getAllLeaves(
    token: string
): Promise<{ success: boolean; leaves?: any[]; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/leaves/all`, {
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        return { success: false, error: "Failed to fetch leave requests" };
    }
}

export async function getStatistics(
    token: string
): Promise<{ success: boolean; statistics?: any; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/leaves/statistics`, {
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return { success: false, error: "Failed to fetch statistics" };
    }
}

export async function reviewLeave(
    token: string,
    leaveId: string,
    action: "Approved" | "Rejected",
    comments: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/leaves/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ leaveId, action, comments }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error reviewing leave:", error);
        return { success: false, error: "Failed to review leave request" };
    }
}

// ==================== USER MANAGEMENT ====================

export async function getAllUsers(): Promise<{
    success: boolean;
    users: any[];
}> {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, users: [] };
    }
}

export async function addUser(data: any): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding user:", error);
        return { success: false, error: "Failed to add user" };
    }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

export async function reinitializeDemoData(): Promise<{
    success: boolean;
    users: { userId: string; name: string; role: string; mobile: string }[];
    error?: string;
}> {
    try {
        const response = await fetch(`${API_BASE}/users/reinitialize`, {
            method: 'POST',
            headers: getAuthHeader(),
        });
        return await response.json();
    } catch (error) {
        console.error("Error initializing demo data:", error);
        return { success: false, users: [], error: "Failed to initialize demo data" };
    }
}
