import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  FileText,
  LogOut,
  PlusCircle,
  User,
  Home,
  Heart,
  Briefcase,
  DollarSign
} from "lucide-react";
import * as mockApi from "../mockApi";

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface LeaveBalance {
  casual: number;
  sick: number;
  earned: number;
  unpaid: number;
}

interface Leave {
  leaveId: string;
  userId: string;
  userName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: string;
  appliedOn: string;
  verifiedBy: string | null;
  verifiedOn: string | null;
  verifiedComments: string | null;
  approvedBy: string | null;
  approvedOn: string | null;
  comments: string | null;
}

const DEMO_USERS_BY_COURSE: Record<string, {name: string, email: string, userId: string}> = {
  "BSc Computer Science": { name: "Rajesh Kumar", email: "stu-cs-01@dgvaishnav.edu.in", userId: "STU-CS-01" },
  "BCA": { name: "Priya Sharma", email: "stu-bca-01@dgvaishnav.edu.in", userId: "STU-BCA-01" },
  "BCom": { name: "Arun Vijay", email: "stu-bcom-01@dgvaishnav.edu.in", userId: "STU-BCOM-01" },
  "BA Economics": { name: "Karthik R", email: "stu-eco-01@dgvaishnav.edu.in", userId: "STU-ECO-01" },
  "BSc Mathematics": { name: "Anjali Menon", email: "stu-math-01@dgvaishnav.edu.in", userId: "STU-MATH-01" },
  "BSc Physics": { name: "Vikram Singh", email: "stu-phy-01@dgvaishnav.edu.in", userId: "STU-PHY-01" },
  "MCA": { name: "Deepa N", email: "stu-mca-01@dgvaishnav.edu.in", userId: "STU-MCA-01" },
  "MBA": { name: "Rahul Dravid", email: "stu-mba-01@dgvaishnav.edu.in", userId: "STU-MBA-01" },
  "MSc IT": { name: "Suresh K", email: "stu-mscit-01@dgvaishnav.edu.in", userId: "STU-MSCIT-01" },
};

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Leave form state
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Reactively calculate statistics based on the leave list
  const statistics = useMemo(() => {
    const approved = leaves.filter(l => l.status === "Approved");
    const rejected = leaves.filter(l => l.status === "Rejected");
    return {
      total: approved.length + rejected.length,
      pending: leaves.filter(l => l.status === "Pending" || l.status === "Verified").length,
      approved: approved.length,
      rejected: rejected.length,
    };
  }, [leaves]);

  // Auto-calculate duration when dates change
  const handleDateChange = (start: string, end: string) => {
    if (start && end) {
      const startD = new Date(start);
      const endD = new Date(end);
      if (endD >= startD) {
        const diffTime = endD.getTime() - startD.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDuration(diffDays.toString());
      }
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Get selected course from localStorage
    const course = localStorage.getItem("selectedCourse");
    setSelectedCourse(course);

    if (course && DEMO_USERS_BY_COURSE[course]) {
      const demoUser = DEMO_USERS_BY_COURSE[course];
      setUser({
        ...parsedUser,
        name: demoUser.name,
        email: demoUser.email,
        userId: demoUser.userId,
        department: course
      });
    } else {
      setUser(parsedUser);
    }

    // Redirect if not student
    if (parsedUser.role !== "Student") {
      navigate("/manager");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      // Fetch leave balance
      const balanceResult = await mockApi.getLeaveBalance(token);
      if (balanceResult.success && balanceResult.balance) {
        setBalance(balanceResult.balance);
      }

      // Fetch leave history
      const leavesResult = await mockApi.getMyLeaves(token);
      if (leavesResult.success && leavesResult.leaves) {
        const demoLeaves: any[] = [
          {
            leaveId: "DEMO-001",
            userId: "STU-DEMO",
            userName: "Demo Student",
            department: "Computer Science",
            leaveType: "Casual Leave",
            startDate: new Date(Date.now() - 604800000).toISOString(),
            endDate: new Date(Date.now() - 518400000).toISOString(),
            duration: 2,
            reason: "Personal work (Demo)",
            status: "Approved",
            appliedOn: new Date(Date.now() - 864000000).toISOString(),
            approvedBy: "HOD-CS",
            approvedOn: new Date(Date.now() - 518400000).toISOString(),
            verifiedBy: null,
            verifiedOn: null,
            verifiedComments: null,
            comments: "Approved for demo purposes"
          },
          {
            leaveId: "DEMO-002",
            userId: "STU-DEMO",
            userName: "Demo Student",
            department: "Computer Science",
            leaveType: "Sick Leave",
            startDate: new Date(Date.now() - 172800000).toISOString(),
            endDate: new Date(Date.now() - 86400000).toISOString(),
            duration: 1,
            reason: "Fever (Demo)",
            status: "Verified",
            appliedOn: new Date(Date.now() - 259200000).toISOString(),
            verifiedBy: "STAFF-CS",
            verifiedOn: new Date(Date.now() - 259200000).toISOString(),
            verifiedComments: "Get well soon!",
            approvedBy: null,
            approvedOn: null,
            comments: null,
          },
          {
            leaveId: "DEMO-003",
            userId: "STU-DEMO",
            userName: "Demo Student",
            department: "Computer Science",
            leaveType: "Casual Leave",
            startDate: new Date(Date.now() - 1209600000).toISOString(),
            endDate: new Date(Date.now() - 1123200000).toISOString(),
            duration: 2,
            reason: "Family event (Demo)",
            status: "Approved",
            appliedOn: new Date(Date.now() - 1500000000).toISOString(),
            approvedBy: "HOD-CS",
            approvedOn: new Date(Date.now() - 1100000000).toISOString(),
            verifiedBy: null,
            verifiedOn: null,
            verifiedComments: null,
            comments: "Enjoy your family event."
          },
          {
            leaveId: "DEMO-004",
            userId: "STU-DEMO",
            userName: "Demo Student",
            department: "Computer Science",
            leaveType: "Sick Leave",
            startDate: new Date(Date.now() - 259200000).toISOString(),
            endDate: new Date(Date.now() - 172800000).toISOString(),
            duration: 1,
            reason: "Migraine (Demo)",
            status: "Rejected",
            appliedOn: new Date(Date.now() - 345600000).toISOString(),
            approvedBy: "STAFF-CS",
            approvedOn: new Date(Date.now() - 172800000).toISOString(),
            verifiedBy: null,
            verifiedOn: null,
            verifiedComments: null,
            comments: "Please provide a medical certificate for frequent sick leaves."
          }
        ];

        const course = localStorage.getItem("selectedCourse");
        let finalDemoLeaves = [...demoLeaves];
        if (course) {
            const code = course.substring(0, 3).toUpperCase();
            finalDemoLeaves = finalDemoLeaves.map(leave => ({
                ...leave,
                leaveId: leave.leaveId.replace("00", code),
                approvedBy: leave.approvedBy ? `HOD-${code}` : null,
                verifiedBy: leave.verifiedBy ? `STAFF-${code}` : null,
            }));
            
            if (course.length % 2 === 0) {
               finalDemoLeaves.pop();
            }
            if (course.length % 3 === 0) {
               finalDemoLeaves.shift();
            }
        }

        setLeaves([...leavesResult.leaves, ...finalDemoLeaves]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem("sessionToken");
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/");
      return;
    }

    try {
      const course = localStorage.getItem("selectedCourse");
      const result = await mockApi.applyLeave(token, {
        leaveType,
        startDate: startDate, // Assuming startDate is already in a suitable string format for the API
        endDate: endDate,     // Assuming endDate is already in a suitable string format for the API
        duration,
        reason,
        department: course || user?.department,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to apply for leave. Please try again.");
        return;
      }

      toast.success("Leave application submitted successfully!");
      setApplyDialogOpen(false);

      // Reset form
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setDuration("");
      setReason("");

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error applying for leave:", error);
      toast.error("Failed to apply for leave. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      try {
        await mockApi.logout(token);
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    localStorage.removeItem("sessionToken");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Verified":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rejected":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Pending":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLeaveIcon = (type: string) => {
    switch (type) {
      case "Casual Leave":
        return <Home className="w-4 h-4" />;
      case "Sick Leave":
        return <Heart className="w-4 h-4" />;
      case "Earned Leave":
        return <Briefcase className="w-4 h-4" />;
      case "Unpaid Leave":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DG VAISHNAV COLLEGE</h1>
                <p className="text-sm text-gray-500">Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.department}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="bg-white border-slate-200 shadow-sm border cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setActiveTab("all")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Applied</p>
                  <p className="text-3xl font-bold mt-1 text-slate-900">{statistics.total}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card 
            className="bg-white border-slate-200 shadow-sm border cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setActiveTab("approved")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">{statistics.approved}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-slate-200 shadow-sm border cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setActiveTab("rejected")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold mt-1 text-rose-600">{statistics.rejected}</p>
                </div>
                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-rose-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* User Info Card */}
        <Card className="mb-6 bg-slate-900 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-blue-100">{user?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {user?.userId}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {selectedCourse || user?.department}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Leave Balance & Apply */}
          <div className="space-y-6">
            {/* Leave Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Leave Balance
                </CardTitle>
                <CardDescription>Your available leave days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-sm">Casual Leave</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{balance?.casual || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-sm">Sick Leave</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{balance?.sick || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-sm">Earned Leave</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{balance?.earned || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm">Unpaid Leave</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">{balance?.unpaid || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Leave Button */}
            <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>Fill in the details for your leave request</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleApplyLeave} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type *</Label>
                    <Select value={leaveType} onValueChange={setLeaveType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                        <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          handleDateChange(e.target.value, endDate);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          handleDateChange(startDate, e.target.value);
                        }}
                        min={startDate}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="e.g., 1 or 0.5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Brief reason for leave"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting || !leaveType || !startDate || !endDate || !duration || !reason}
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setApplyDialogOpen(false);
                        // Reset form on cancel
                        setLeaveType("");
                        setStartDate("");
                        setEndDate("");
                        setDuration("");
                        setReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Right Column - Leave History */}
          <section className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Leave History
            </h2>
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 pt-4 border-b">
                    <TabsList className="bg-transparent h-auto p-0 gap-8 mb-0">
                      <TabsTrigger 
                        value="all" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 pb-3"
                      >
                        All Applications
                      </TabsTrigger>
                      <TabsTrigger 
                        value="approved" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 pb-3"
                      >
                        Approved
                      </TabsTrigger>
                      <TabsTrigger 
                        value="rejected" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 pb-3"
                      >
                        Rejected
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="divide-y overflow-auto max-h-[600px]">
                    <TabsContent value="all" className="mt-0">
                      {leaves.filter(l => l.status === "Approved" || l.status === "Rejected").length === 0 ? (
                        <div className="p-12 text-center">
                          <p className="text-slate-500">No leave applications found.</p>
                        </div>
                      ) : (
                        leaves.filter(l => l.status === "Approved" || l.status === "Rejected").map((leave) => (
                          <div
                            key={leave.leaveId}
                            className="border-b last:border-b-0 p-4 hover:bg-slate-50 transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                                  {getLeaveIcon(leave.leaveType)}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{leave.leaveType}</h4>
                                  <p className="text-sm text-gray-500">ID: {leave.leaveId}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(leave.status)}>
                                {leave.status}
                              </Badge>
                            </div>

                            <Separator className="my-3" />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Duration</p>
                                <p className="font-medium">{leave.duration} day(s)</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Period</p>
                                <p className="font-medium">
                                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Applied On</p>
                                <p className="font-medium">{new Date(leave.appliedOn).toLocaleDateString()}</p>
                              </div>
                              {leave.approvedBy && (
                                <div>
                                  <p className="text-gray-500 mb-1">Reviewed By</p>
                                  <p className="font-medium">{leave.approvedBy}</p>
                                </div>
                              )}
                            </div>

                            <div className="mt-3">
                              <p className="text-gray-500 text-sm mb-1">Reason</p>
                              <p className="text-sm">{leave.reason}</p>
                            </div>

                            {leave.comments && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-400">
                                <p className="text-gray-500 text-xs mb-1 uppercase tracking-tight font-bold">HOD Final Comments</p>
                                <p className="text-sm">{leave.comments}</p>
                              </div>
                            )}
                            
                            {leave.verifiedComments && (
                              <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border-l-4 border-blue-400">
                                <p className="text-blue-600 text-xs mb-1 uppercase tracking-tight font-bold">Staff / Faculty Review</p>
                                <p className="text-sm italic">{leave.verifiedComments}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </TabsContent>


                    <TabsContent value="approved" className="mt-0">
                      <div className="divide-y">
                        {leaves.filter(l => l.status === "Approved").length === 0 ? (
                          <div className="p-12 text-center text-slate-500">No approved leave applications.</div>
                        ) : (
                          leaves.filter(l => l.status === "Approved").map((leave) => (
                            <div key={leave.leaveId} className="p-6 hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-slate-900">{leave.leaveType}</h4>
                                  <p className="text-sm text-slate-500">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                </div>
                                <Badge className={getStatusColor(leave.status)} variant="outline">{leave.status}</Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="rejected" className="mt-0">
                      <div className="divide-y">
                        {leaves.filter(l => l.status === "Rejected").length === 0 ? (
                          <div className="p-12 text-center text-slate-500">No rejected leave applications.</div>
                        ) : (
                          leaves.filter(l => l.status === "Rejected").map((leave) => (
                            <div key={leave.leaveId} className="p-6 hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-slate-900">{leave.leaveType}</h4>
                                  <p className="text-sm text-slate-500">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                </div>
                                <Badge className={getStatusColor(leave.status)} variant="outline">{leave.status}</Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}