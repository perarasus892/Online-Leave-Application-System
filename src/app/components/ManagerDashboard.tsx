import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import {
  Calendar,
  LogOut,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Users,
} from "lucide-react";
import * as mockApi from "../mockApi";
import { AdminPanel } from "./AdminPanel";

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
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
  approvedBy: string | null;
  approvedOn: string | null;
  comments: string | null;
}

interface Statistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
  byDepartment: Record<string, number>;
}

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected">("Approved");
  const [reviewComments, setReviewComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Filter leaves first
  const filteredLeaves = selectedDepartment
    ? allLeaves.filter((l) => l.department === selectedDepartment)
    : allLeaves;

  // Reactively calculate statistics based on the currently filtered list
  // This ensures "Mutual Working" between the list and the analytics cards
  const statistics = useMemo(() => {
    const stats: Statistics = {
      total: filteredLeaves.length,
      pending: filteredLeaves.filter(l => l.status === "Pending" || l.status === "Verified").length,
      approved: filteredLeaves.filter(l => l.status === "Approved").length,
      rejected: filteredLeaves.filter(l => l.status === "Rejected").length,
      byType: {},
      byDepartment: {},
    };

    filteredLeaves.forEach(leave => {
      stats.byType[leave.leaveType] = (stats.byType[leave.leaveType] || 0) + 1;
      stats.byDepartment[leave.department] = (stats.byDepartment[leave.department] || 0) + 1;
    });

    return stats;
  }, [filteredLeaves]);

  const pendingLeaves = filteredLeaves.filter((l) => l.status === "Pending" || l.status === "Verified");
  const approvedLeaves = filteredLeaves.filter((l) => l.status === "Approved");
  const rejectedLeaves = filteredLeaves.filter((l) => l.status === "Rejected");

  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Redirect if employee or staff
    if (parsedUser.role === "Student") {
      navigate("/employee");
      return;
    }
    if (parsedUser.role === "Staff") {
      navigate("/staff");
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
      // Fetch all leave requests
      const leavesResult = await mockApi.getAllLeaves(token);
      let combinedLeaves: Leave[] = [];
      
      if (leavesResult.success && leavesResult.leaves) {
        const demoLeaves = [
          {
            leaveId: "DEMO-HOD-01",
            userId: "STAFF-DEMO-01",
            userName: "Prof. Rajesh (Demo)",
            department: user?.department || "BSc Computer Science",
            leaveType: "Casual Leave",
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 172800000).toISOString(),
            duration: 1,
            reason: "Personal work (Demo)",
            status: "Pending",
            appliedOn: new Date().toISOString(),
            approvedBy: null,
            approvedOn: null,
            comments: null,
          },
          {
            leaveId: "DEMO-HOD-02",
            userId: "STU-DEMO-03",
            userName: "Arun Kumar (Demo Student)",
            department: user?.department || "BSc Computer Science",
            leaveType: "Sick Leave",
            startDate: new Date(Date.now() + 259200000).toISOString(),
            endDate: new Date(Date.now() + 432000000).toISOString(),
            duration: 2,
            reason: "Fever (Demo)",
            status: "Verified",
            appliedOn: new Date().toISOString(),
            approvedBy: null,
            approvedOn: null,
            comments: null,
            verifiedBy: "STAFF-CS",
            verifiedComments: "Forwarded for final approval."
          },
          {
            leaveId: "DEMO-HOD-03",
            userId: "STAFF-DEMO-02",
            userName: "Dr. Kavitha (Demo)",
            department: user?.department || "Physics",
            leaveType: "On Duty",
            startDate: new Date(Date.now() - 172800000).toISOString(),
            endDate: new Date(Date.now() - 86400000).toISOString(),
            duration: 1,
            reason: "Physics Seminar (Demo)",
            status: "Approved",
            appliedOn: new Date().toISOString(),
            approvedBy: user?.userId || "ADMIN",
            approvedOn: new Date().toISOString(),
            comments: "Forwarded and approved."
          },
          {
            leaveId: "DEMO-HOD-04",
            userId: "STU-DEMO-04",
            userName: "Manoj Swamy (Demo)",
            department: user?.department || "Commerce",
            leaveType: "Casual Leave",
            startDate: new Date(Date.now() - 86400000).toISOString(),
            endDate: new Date().toISOString(),
            duration: 1,
            reason: "Family function (Demo)",
            status: "Rejected",
            appliedOn: new Date().toISOString(),
            approvedBy: user?.userId || "ADMIN",
            approvedOn: new Date().toISOString(),
            comments: "Insufficient notice period."
          }
        ];
        combinedLeaves = [...leavesResult.leaves, ...demoLeaves];
        setAllLeaves(combinedLeaves);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLeave = async () => {
    if (!selectedLeave) return;

    setSubmitting(true);
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      if (selectedLeave.leaveId.startsWith("DEMO-")) {
        // Handle demo leaves locally
        setAllLeaves(prev => prev.map(l => 
          l.leaveId === selectedLeave.leaveId 
            ? { ...l, status: reviewAction, comments: reviewComments } 
            : l
        ));
        toast.success(`Demo leave ${reviewAction.toLowerCase()} successfully!`);
      } else {
        // Handle real leaves via backend
        const result = await mockApi.reviewLeave(
          token,
          selectedLeave.leaveId,
          reviewAction,
          reviewComments
        );

        if (!result.success) {
          toast.error(result.error || "Failed to review leave");
          return;
        }

        toast.success(`Leave ${reviewAction.toLowerCase()} successfully!`);
        // Refresh data only for real leaves
        fetchData();
      }

      setReviewDialogOpen(false);
      setSelectedLeave(null);
      setReviewComments("");
    } catch (error) {
      console.error("Error reviewing leave:", error);
      toast.error("Failed to review leave request");
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

  const openReviewDialog = (leave: Leave, action: "Approved" | "Rejected") => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "Admin": return "College Admin";
      case "HOD": return "HOD";
      case "Staff": return "Faculty / Staff";
      case "Student": return "Student";
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Rejected":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Pending":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">DG VAISHNAV COLLEGE</h1>
                <p className="text-sm text-gray-500 font-medium">
                  {user?.role === "Admin" ? "College Administrator Portal" : "HOD / Faculty Portal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">
                  {getRoleLabel(user?.role || "")} • {user?.department}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200 shadow-sm border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Requests</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics?.total || 0}</p>
                </div>
                <FileText className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-slate-200 shadow-sm border cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setActiveTab("pending")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics?.pending || 0}</p>
                </div>
                <Clock className="w-10 h-10 text-indigo-600 opacity-20" />
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
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics?.approved || 0}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-indigo-600 opacity-20" />
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
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics?.rejected || 0}</p>
                </div>
                <XCircle className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leave Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Leave Requests
                </CardTitle>
                <CardDescription>
                  {user?.role === "Admin" ? "Approve HOD leave requests" : "Review Faculty and Student leave requests"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                      Pending ({pendingLeaves.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Approved ({approvedLeaves.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                      Rejected ({rejectedLeaves.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="mt-4">
                    {pendingLeaves.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No pending requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingLeaves.map((leave) => (
                          <div key={leave.leaveId}>
                            <LeaveRequestCard
                              leave={leave}
                              // onApprove={() => openReviewDialog(leave, "Approved")}
                              // onReject={() => openReviewDialog(leave, "Rejected")}
                              // showActions
                            />
                            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-50 px-4"
                                onClick={() => openReviewDialog(leave, "Rejected")}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-sm px-4"
                                onClick={() => openReviewDialog(leave, "Approved")}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verify
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="approved" className="mt-4">
                    {approvedLeaves.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No approved requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {approvedLeaves.map((leave) => (
                          <LeaveRequestCard key={leave.leaveId} leave={leave} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="rejected" className="mt-4">
                    {rejectedLeaves.length === 0 ? (
                      <div className="text-center py-12">
                        <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No rejected requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rejectedLeaves.map((leave) => (
                          <LeaveRequestCard key={leave.leaveId} leave={leave} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Leave by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics && Object.entries(statistics.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {user?.role === "Admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    By Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedDepartment(null)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        !selectedDepartment 
                          ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" 
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`text-sm font-medium ${!selectedDepartment ? "text-indigo-700" : "text-gray-700"}`}>
                        All Courses
                      </span>
                      <Badge variant="secondary" className={!selectedDepartment ? "bg-indigo-100 text-indigo-700" : ""}>
                        {allLeaves.length}
                      </Badge>
                    </button>
                    
                    {statistics && Object.entries(statistics.byDepartment).map(([dept, count]) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDepartment(dept)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          selectedDepartment === dept
                            ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200"
                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`text-sm font-medium ${selectedDepartment === dept ? "text-indigo-700" : "text-gray-700"}`}>
                          {dept}
                        </span>
                        <Badge variant="secondary" className={selectedDepartment === dept ? "bg-indigo-100 text-indigo-700" : ""}>
                          {count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Admin User Management — only visible to Admin role */}
        {user?.role === "Admin" && (
          <div className="mt-8">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "Approved" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              Review and {reviewAction.toLowerCase()} the leave request from {selectedLeave?.userName}
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Student</span>
                  <span className="text-sm font-medium">{selectedLeave.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Leave Type</span>
                  <span className="text-sm font-medium">{selectedLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium">{selectedLeave.duration} day(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Period</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <Label>Reason</Label>
                <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedLeave.reason}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Add any comments for the student"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                <Button
                  className={`px-8 ${reviewAction === "Rejected" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  onClick={handleReviewLeave}
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : (reviewAction === "Approved" ? "Verify \u0026 Forward" : "Confirm Reject")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Component for Leave Request Card
function LeaveRequestCard({
  leave,
  onApprove,
  onReject,
  showActions = false,
}: {
  leave: Leave;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Rejected":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Pending":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{leave.userName}</h4>
            <p className="text-sm text-gray-500">{leave.department} • {leave.userId}</p>
          </div>
        </div>
        <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500 mb-1">Leave Type</p>
          <p className="font-medium">{leave.leaveType}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Duration</p>
          <p className="font-medium">{leave.duration} day(s)</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Start Date</p>
          <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">End Date</p>
          <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-gray-500 text-sm mb-1">Reason</p>
        <p className="text-sm text-gray-700">{leave.reason}</p>
      </div>

      {leave.comments && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">HOD / Faculty Comments</p>
          <p className="text-sm">{leave.comments}</p>
        </div>
      )}

      {showActions && (
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs text-slate-600 hover:text-slate-700 hover:bg-slate-50 border-slate-200 px-4"
            onClick={onReject}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 px-4"
            onClick={onApprove}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Approve
          </Button>
        </div>
      )}
    </div>
  );
}
