import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { UserPlus, Trash2, Users, Mail, Phone, Building2, Briefcase, Shield } from "lucide-react";
import * as mockApi from "../mockApi";

interface UserRow {
    userId: string;
    name: string;
    email: string;
    mobileNumber: string;
    role: string;
    department: string;
    designation: string;
    joiningDate: string;
}

export function AdminPanel() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [newUserId, setNewUserId] = useState("");
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newMobile, setNewMobile] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newDepartment, setNewDepartment] = useState("");
    const [newDesignation, setNewDesignation] = useState("");

    const fetchUsers = async () => {
        const result = await mockApi.getAllUsers();
        if (result.success) {
            setUsers(result.users);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const resetForm = () => {
        setNewUserId("");
        setNewName("");
        setNewEmail("");
        setNewMobile("");
        setNewRole("");
        setNewDepartment("");
        setNewDesignation("");
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await mockApi.addUser({
            userId: newUserId.toUpperCase(),
            name: newName,
            email: newEmail,
            mobileNumber: newMobile,
            role: newRole,
            department: newDepartment,
            designation: newDesignation,
        });

        if (!result.success) {
            toast.error(result.error || "Failed to add user");
            setLoading(false);
            return;
        }

        toast.success(`User ${newUserId.toUpperCase()} added successfully!`);
        setAddDialogOpen(false);
        resetForm();
        fetchUsers();
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to remove ${userName} (${userId})?`)) return;

        const result = await mockApi.deleteUser(userId);
        if (!result.success) {
            toast.error(result.error || "Failed to remove user");
            return;
        }

        toast.success(`User ${userId} removed successfully`);
        fetchUsers();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "Admin":
                return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "Manager":
                return "bg-slate-100 text-slate-800 border-slate-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "Admin": return "College Admin";
            case "Manager": return "HOD";
            case "Employee": return "Student";
            default: return role;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Leave Management
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Add, view, and manage college students and staff
                        </CardDescription>
                    </div>
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add New Student / HOD
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New User / Staff</DialogTitle>
                                <DialogDescription>
                                    Create a new account. They can login immediately.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newUserId">
                                            <Shield className="w-3.5 h-3.5 inline mr-1" />
                                            User ID *
                                        </Label>
                                        <Input
                                            id="newUserId"
                                            placeholder="e.g., EMP003"
                                            value={newUserId}
                                            onChange={(e) => setNewUserId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newRole">
                                            <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                                            Role *
                                        </Label>
                                        <Select value={newRole} onValueChange={setNewRole} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Student">Student</SelectItem>
                                                <SelectItem value="Staff">Faculty / Staff</SelectItem>
                                                <SelectItem value="HOD">HOD</SelectItem>
                                                <SelectItem value="Admin">College Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newName">Full Name *</Label>
                                    <Input
                                        id="newName"
                                        placeholder="Enter full name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newEmail">
                                        <Mail className="w-3.5 h-3.5 inline mr-1" />
                                        Email
                                    </Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        placeholder="user@company.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newMobile">
                                        <Phone className="w-3.5 h-3.5 inline mr-1" />
                                        Mobile Number *
                                    </Label>
                                    <Input
                                        id="newMobile"
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        value={newMobile}
                                        onChange={(e) => setNewMobile(e.target.value)}
                                        maxLength={10}
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newDepartment">
                                            <Building2 className="w-3.5 h-3.5 inline mr-1" />
                                            Course / Dept *
                                        </Label>
                                        <Input
                                            id="newDepartment"
                                            placeholder="e.g., Computer Science"
                                            value={newDepartment}
                                            onChange={(e) => setNewDepartment(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newDesignation">Designation</Label>
                                        <Input
                                            id="newDesignation"
                                            placeholder="e.g., Developer"
                                            value={newDesignation}
                                            onChange={(e) => setNewDesignation(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                        disabled={loading || !newUserId || !newName || !newMobile || !newRole || !newDepartment}
                                    >
                                        {loading ? "Adding..." : "Add User"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                                        onClick={() => {
                                            setAddDialogOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No users registered</p>
                            <p className="text-sm text-gray-400 mt-1">Add your first user to get started</p>
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.userId}
                                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{user.name}</h4>
                                            <Badge className={getRoleBadgeColor(user.role)}>
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span>{user.userId}</span>
                                            <Separator orientation="vertical" className="h-3" />
                                            <span>{user.department}</span>
                                            <Separator orientation="vertical" className="h-3" />
                                            <span>{user.mobileNumber}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    onClick={() => handleDeleteUser(user.userId, user.name)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
