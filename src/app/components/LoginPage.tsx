import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { toast } from "sonner";
import { Building2, Shield, Clock, Users } from "lucide-react";
import * as mockApi from "../mockApi";

export function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [userId, setUserId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpInfo, setOtpInfo] = useState<{ otp: string; expiresIn: number } | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await mockApi.sendOtp(userId, mobileNumber);

      if (!result.success) {
        toast.error(result.error || "Failed to send OTP");
        return;
      }

      setOtpInfo({ otp: result.otp!, expiresIn: result.expiresIn! });
      setStep("otp");
      toast.success("OTP sent to your registered mobile number.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await mockApi.verifyOtp(userId, otp);

      if (!result.success) {
        toast.error(result.error || "Invalid OTP");
        return;
      }

      // Store session
      localStorage.setItem("sessionToken", result.token!);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login successful!");

      // Redirect based on role
      const role = result.user.role;
      if (role === "Admin" || role === "HOD") {
        navigate("/manager");
      } else if (role === "Staff") {
        navigate("/staff");
      } else {
        navigate("/select-course");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-indigo-600 leading-tight">
                DG VAISHNAV COLLEGE
              </h1>
            </div>
            <p className="text-xl text-gray-600 uppercase tracking-wide font-medium">
              LEAVE APPLICATION AND TRACKING
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Shield className="w-10 h-10 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Secure Access</h3>
              <p className="text-sm text-gray-600">OTP-based authentication</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Clock className="w-10 h-10 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Real-time</h3>
              <p className="text-sm text-gray-600">Instant leave updates</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Users className="w-10 h-10 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Role-based</h3>
              <p className="text-sm text-gray-600">Role-based views</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Building2 className="w-10 h-10 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Campus-wide</h3>
              <p className="text-sm text-gray-600">Unified college solution</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">
              {step === "credentials" ? "Sign In" : "Verify OTP"}
            </CardTitle>
            <CardDescription>
              {step === "credentials"
                ? "Enter your credentials to access your account"
                : "Enter the 6-digit OTP sent to your mobile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "credentials" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter your User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {otpInfo && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-900">
                      <strong>Your OTP:</strong> {otpInfo.otp}
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Valid for {Math.floor(otpInfo.expiresIn / 60)} minutes. Do not share this code.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep("credentials");
                      setOtp("");
                      setOtpInfo(null);
                    }}
                  >
                    Back
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
