import React, { useState, useEffect } from "react";
import { Mail, Users, Lock, KeyRound } from "lucide-react";
import API from "../../api/axios";
import ThemeToggle from "../../components/ThemeToggle";
import { useNavigate } from "react-router-dom";
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);
  const [formData, setFormData] = useState({
    email: "",
    role: "user",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // STEP 1 → SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (sendLoading) return;
    setError("");
    setSuccess("");

    setSendLoading(true);

    try {
      await API.post("/auth/forgot-password", {
        email: formData.email,
        role: formData.role
      });

      setSuccess("OTP sent to your email");
      setTimer(60);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally {
      setSendLoading(false);
    }

    
  };

  // STEP 2 → VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (verifyLoading) return;
    setError("");
    setSuccess("");

    setVerifyLoading(true);

    try {
      await API.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
        role: formData.role
      });

      setSuccess("OTP verified");
      setFormData(prev => ({
        ...prev,
        otp: ""
      }));
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyLoading(false);
    }

    
  };

  // STEP 3 → RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetLoading) return;
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setResetLoading(true);

    try {
      await API.post("/auth/reset-password", {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setSuccess("Password reset successful");
      // ✅ clear password fields
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setResetLoading(false);
    }

    
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-100 dark:bg-[#050816] transition-all duration-500">

      {/* Background same as login */}
      <div className="absolute top-20 left-10 w-[420px] h-[420px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-10 right-10 w-[320px] h-[320px] bg-cyan-400/10 rounded-full blur-3xl" />
      {/* Header */}
      <div
        className="
            relative
            z-20
            px-8
            py-5
            flex
            justify-between
            items-center
            border-b
            border-gray-200
            dark:border-white/10
            bg-white/40
            dark:bg-white/5
            backdrop-blur-2xl
        "
        >
        <div>
            <h1
            className="
                text-2xl
                font-bold
                bg-gradient-to-r
                from-blue-600
                via-cyan-500
                to-purple-500
                bg-clip-text
                text-transparent
            "
            >
            CertiChain
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-300">
            Trust, Engineered on Blockchain
            </p>
        </div>

        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-90px)] px-6">
        <div className="w-full max-w-md">

          <div
            className="
                rounded-3xl
                border
                bg-white/75
                dark:bg-white/5
                border-gray-200
                dark:border-white/10
                backdrop-blur-2xl
                shadow-2xl
                p-8
                hover:shadow-[0_25px_70px_rgba(0,0,0,0.18)]
                transition-all
                duration-500
            "
          >

            <h2 className="text-3xl mb-6 font-bold text-center text-gray-900 dark:text-white">
                Reset Password
            </h2>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-3 rounded-xl bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-300 text-sm">
                {success}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">

                {/* Email */}
                <div className="relative group transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
                    <Mail
                    size={18}
                    className="absolute left-4 top-4 z-10 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-all duration-300"
                    />
                    <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none bg-white dark:bg-white/5 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:scale-[1.01] transition-all"
                    />
                </div>

                {/* Role */}
                <div className="relative group transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
                    <Users
                    size={18}
                    className="absolute left-4 top-4 z-10 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-all duration-300"
                    />
                    <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none appearance-none bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    >
                    <option value="user">User</option>
                    <option value="institute">Institute</option>
                    <option value="verifier">Verifier</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={sendLoading}                    
                    className={`
                      w-full py-3 rounded-xl font-semibold text-white
                      ${sendLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
                      shadow-lg hover:scale-[1.02] transition-all duration-300
                    `}
                >
                    {sendLoading ? "Sending..." : "Send OTP"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="
                    w-full py-3 rounded-xl font-semibold text-white
                    bg-red-600 hover:bg-red-650
                    shadow-lg hover:scale-[1.02] transition-all duration-300
                  "
                >
                  Cancel
                </button>

                </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">

                <div className="relative group transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
                    <KeyRound
                    size={18}
                    className="absolute left-4 top-4 z-10 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-all duration-300"
                    />
                    <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none bg-white dark:bg-white/5 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:scale-[1.01] transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={verifyLoading}
                    className={`
                      w-full py-3 rounded-xl font-semibold text-white
                      ${verifyLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
                      shadow-lg hover:scale-[1.02] transition-all duration-300
                    `}
                >
                    {verifyLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={timer > 0 || sendLoading}
                    className={`
                      mt-2 w-full py-3 rounded-xl font-semibold border transition-all duration-300
                      ${timer > 0 || sendLoading
                        ? "text-gray-400 border-gray-300 cursor-not-allowed"
                        : "text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg"
                      }
                    `}
                    >
                      {timer > 0
                        ? `Resend in ${timer}s`
                        : sendLoading
                        ? "Sending..."
                        : "Resend OTP"
                      }
                </button>

                </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">

                {/* Password */}
                <div className="relative group transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
                    <Lock
                    size={18}
                    className="absolute left-4 top-4 z-10 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-all duration-300"
                    />
                    <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none bg-white dark:bg-white/5 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:scale-[1.01] transition-all"
                    />
                </div>

                {/* Confirm Password */}
                <div className="relative group transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
                    <KeyRound
                    size={18}
                    className="absolute left-4 top-4 z-10 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-all duration-300"
                    />
                    <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none bg-white dark:bg-white/5 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:scale-[1.01] transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={resetLoading}
                    className={`w-full py-3 rounded-xl font-semibold text-white 
                    ${resetLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} 
                    shadow-lg hover:scale-[1.02] transition-all duration-300`}
                >
                    {resetLoading ? "Updating..." : "Reset Password"}
                </button>

                </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;