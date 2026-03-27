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
  User as UserIcon,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Users,
} from "lucide-react";
import * as mockApi from "../mockApi";

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
  verifiedBy: string | null;
  verifiedOn: string | null;
  verifiedComments: string | null;
  approvedBy: string | null;
  approvedOn: string | null;
  comments: string | null;
}

export function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected">("Approved");
  const [reviewComments, setReviewComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Reactively calculate statistics based on the currently filtered list
  const statistics = useMemo(() => {
    const stats = {
      total: allLeaves.length,
      pending: allLeaves.filter(l => l.status === "Pending").length,
      verified: allLeaves.filter(l => l.status === "Verified").length,
      rejected: allLeaves.filter(l => l.status === "Rejected").length,
    };
    return stats;
  }, [allLeaves]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== "Staff") {
      navigate("/");
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
      const leavesResult = await mockApi.getAllLeaves(token);
      if (leavesResult.success && leavesResult.leaves) {
        const demoLeaves = [
          {
            leaveId: "DEMO-STU-01",
            userId: "STU-DEMO-X",
            userName: "Amit Kumar (Demo)",
            department: user?.department || "BSc Computer Science",
            leaveType: "Sick Leave",
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 172800000).toISOString(),
            duration: 1,
            reason: "Fever and cold (Demo)",
            status: "Pending",
            appliedOn: new Date().toISOString(),
          },
          {
            leaveId: "DEMO-STU-02",
            userId: "STU-DEMO-Y",
            userName: "Priya Singh (Demo)",
            department: user?.department || "BSc Computer Science",
            leaveType: "Casual Leave",
            startDate: new Date(Date.now() + 259200000).toISOString(),
            endDate: new Date(Date.now() + 432000000).toISOString(),
            duration: 2,
            reason: "Personal work (Demo)",
            status: "Pending",
            appliedOn: new Date().toISOString(),
          },
          {
            leaveId: "DEMO-STU-03",
            userId: "STU-DEMO-Z",
            userName: "Vikram R. (Demo)",
            department: user?.department || "Physics",
            leaveType: "On Duty",
            startDate: new Date(Date.now() - 172800000).toISOString(),
            endDate: new Date(Date.now() - 86400000).toISOString(),
            duration: 1,
            reason: "NCC Camp (Demo)",
            status: "Verified",
            appliedOn: new Date().toISOString(),
            verifiedBy: user?.userId || "STAFF-CS",
            verifiedOn: new Date().toISOString(),
            verifiedComments: "Documents verified."
          },
          {
            leaveId: "DEMO-STU-04",
            userId: "STU-DEMO-W",
            userName: "Sneha G. (Demo)",
            department: user?.department || "Commerce",
            leaveType: "Casual Leave",
            startDate: new Date(Date.now() - 86400000).toISOString(),
            endDate: new Date().toISOString(),
            duration: 1,
            reason: "Out of station (Demo)",
            status: "Rejected",
            appliedOn: new Date().toISOString(),
            verifiedBy: user?.userId || "STAFF-CS",
            verifiedOn: new Date().toISOString(),
            verifiedComments: "Lack of specific reason."
          }
        ];
        setAllLeaves([...leavesResult.leaves, ...demoLeaves]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch student requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLeave = async () => {
    if (!selectedLeave) return;

    setSubmitting(true);
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    try {
      if (selectedLeave.leaveId.startsWith("DEMO-")) {
        // Handle demo leaves locally
        setAllLeaves(prev => prev.map(l => 
          l.leaveId === selectedLeave.leaveId 
            ? { ...l, status: reviewAction === "Approved" ? "Verified" : "Rejected" } 
            : l
        ));
        toast.success(reviewAction === "Approved" ? "Demo student leave verified!" : "Demo student leave rejected");
      } else {
        // Handle real leaves via backend
        const result = await mockApi.reviewLeave(
          token,
          selectedLeave.leaveId,
          reviewAction,
          reviewComments
        );

        if (!result.success) {
          toast.error(result.error || "Failed to verify leave");
          return;
        }

        toast.success(reviewAction === "Approved" ? "Leave verified!" : "Leave rejected");
        // Refresh data only for real leaves
        fetchData();
      }

      setReviewDialogOpen(false);
      setSelectedLeave(null);
      setReviewComments("");
    } catch (error) {
      console.error("Error reviewing leave:", error);
      toast.error("Failed to process request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
      case "Approved": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Rejected": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-indigo-50 text-indigo-700 border-indigo-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Staff Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 uppercase">DG VAISHNAV COLLEGE</h1>
              <p className="text-sm text-gray-500 font-medium">Faculty / Staff Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Faculty • {user?.department}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-white border-slate-200 shadow-sm border cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setActiveTab("pending")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-slate-200 shadow-sm border cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setActiveTab("verified")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Verified</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics.verified}</p>
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
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics.rejected}</p>
                </div>
                <XCircle className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Managed</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">{statistics.total}</p>
                </div>
                <Users className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-8 overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader className="bg-slate-900 text-white pb-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Leave Verification</CardTitle>
                <CardDescription className="text-slate-300">
                  Verify and mentor students in the **{user?.department}** department.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending">Pending ({statistics.pending})</TabsTrigger>
                <TabsTrigger value="verified">Verified ({statistics.verified})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({statistics.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {allLeaves.filter(l => l.status === "Pending").length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No pending student leave requests.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {allLeaves.filter(l => l.status === "Pending").map((leave) => (
                      <div key={leave.leaveId} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{leave.userName}</h4>
                              <p className="text-xs text-slate-500 font-medium">ID: {leave.userId}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(leave.status)} variant="outline">{leave.status}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-slate-500 text-xs">Leave Type</p>
                            <p className="font-semibold text-slate-800">{leave.leaveType}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-500 text-xs">Duration</p>
                            <p className="font-semibold text-slate-800">{leave.duration} Days</p>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <p className="text-slate-500 text-xs">Period</p>
                            <p className="font-semibold text-slate-800">
                              {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg mb-4">
                          <p className="text-slate-500 text-xs mb-1">Reason</p>
                          <p className="text-sm text-slate-700 italic">"{leave.reason}"</p>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-slate-600 border-slate-200 hover:bg-slate-50 px-6"
                            onClick={() => openReviewDialog(leave, "Rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm px-6"
                            onClick={() => openReviewDialog(leave, "Approved")}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Verify
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="verified">
                <div className="grid md:grid-cols-2 gap-6">
                  {allLeaves.filter(l => l.status === "Verified").map((leave) => (
                    <div key={leave.leaveId} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            {leave.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{leave.userName}</h4>
                            <p className="text-xs text-slate-500">{leave.userId}</p>
                          </div>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Verified</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-slate-500 mb-1 uppercase tracking-wider font-semibold">Type</p>
                          <p className="font-bold text-slate-800">{leave.leaveType}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1 uppercase tracking-wider font-semibold">Duration</p>
                          <p className="font-bold text-slate-800">{leave.duration} Days</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Reason</p>
                        <p className="text-sm text-slate-700 italic">"{leave.reason}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rejected">
                <div className="grid md:grid-cols-2 gap-6">
                  {allLeaves.filter(l => l.status === "Rejected").map((leave) => (
                    <div key={leave.leaveId} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm opacity-75">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold">
                            {leave.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{leave.userName}</h4>
                            <p className="text-xs text-slate-500">{leave.userId}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-slate-500 border-slate-200">Rejected</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-slate-500 mb-1 uppercase tracking-wider font-semibold">Type</p>
                          <p className="font-bold text-slate-800">{leave.leaveType}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1 uppercase tracking-wider font-semibold">Duration</p>
                          <p className="font-bold text-slate-800">{leave.duration} Days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              {reviewAction === "Approved" ? "Verify this student's leave for HOD approval" : "Reject this student's leave request"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mentoring Comments</Label>
              <Textarea 
                placeholder="Add your comments here..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
              <Button 
                className={`flex-1 ${reviewAction === "Rejected" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                onClick={handleReviewLeave}
                disabled={submitting}
              >
                {submitting ? "Processing..." : (reviewAction === "Approved" ? "Verify \u0026 Forward" : "Confirm Reject")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
