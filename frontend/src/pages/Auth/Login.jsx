import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Users } from "lucide-react";

import API from "../../api/axios";
import ThemeToggle from "../../components/ThemeToggle";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.id || "");
      localStorage.setItem("userName", res.data.name || "");

      const role = res.data.role;
      toast.success("Login successful");
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "institute") navigate("/institute-dashboard");
      else if (role === "user") navigate("/user-dashboard");
      else if (role === "verifier") navigate("/verifier-dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    }

    setLoading(false);
  };

  return (
    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        bg-gray-100
        dark:bg-[#050816]
        transition-all
        duration-500
      "
    >
      {/* Dynamic Floating Background */}
      <div className="absolute top-20 left-10 w-[420px] h-[420px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-[320px] h-[320px] bg-cyan-400/10 rounded-full blur-3xl" />

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

      {/* Main */}
      <div className="relative z-10 min-h-[calc(100vh-90px)] flex items-center justify-center px-6">
        <div className="w-full max-w-7xl grid md:grid-cols-2 gap-16 items-center">

          {/* Left Branding Section */}
          <div className="hidden md:block">
            <p className="text-blue-600 font-semibold mb-3 tracking-wide">
              BLOCKCHAIN POWERED SECURITY
            </p>

            <h2 className="text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Secure
              <br />
              Instant
              <br />
              <span
                className="
                  bg-gradient-to-r
                  from-blue-500
                  via-cyan-400
                  to-purple-500
                  bg-clip-text
                  text-transparent
                "
              >
                Trust
              </span>
            </h2>

            <p className="mt-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-xl">
              Issue certificates securely, verify authenticity instantly,
              and manage controlled access using decentralized blockchain-backed trust.
              Built for institutions, users, and verification teams.
            </p>

            <div
              className="
                mt-10
                rounded-3xl
                border
                bg-white/40
                dark:bg-white/5
                border-gray-200
                dark:border-white/10
                backdrop-blur-2xl
                shadow-2xl
                p-7
                hover:scale-[1.02]
                transition-all
                duration-300
              "
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Eliminate fake certificates, ensure integrity,
                and provide trusted time-based controlled access
                using blockchain verification.
              </p>
            </div>
          </div>

          {/* Login Card */}
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
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Welcome
            </h2>

            <p className="text-center mt-2 mb-8 text-gray-600 dark:text-gray-300">
              Login securely to continue
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div
                  className="
                    relative group
                    transition-all
                    duration-300
                    hover:scale-[1.01]
                    focus-within:scale-[1.01]
                  "
                >
                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-4
                    z-10
                    text-gray-400
                    group-focus-within:text-blue-600
                    dark:group-focus-within:text-cyan-400
                    transition-all
                    duration-300
                  "
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3
                    rounded-xl
                    border
                    outline-none
                    bg-white
                    dark:bg-white/5
                    border-gray-300
                    dark:border-gray-700
                    text-gray-900
                    dark:text-white
                    focus:scale-[1.01]
                    transition-all
                  "
                />
              </div>

              {/* Password */}
              <div
                className="
                  relative group
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  focus-within:scale-[1.01]
                "
              >
                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-4
                    z-10
                    text-gray-400
                    group-focus-within:text-blue-600
                    dark:group-focus-within:text-cyan-400
                    transition-all
                    duration-300
                  "
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3
                    rounded-xl
                    border
                    outline-none
                    bg-white
                    dark:bg-white/5
                    border-gray-300
                    dark:border-gray-700
                    text-gray-900
                    dark:text-white
                    focus:scale-[1.01]
                    transition-all
                  "
                />
              </div>

              {/* Role */}
              <div className="
                  relative group
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  focus-within:scale-[1.01]
                ">
                <Users
                  size={18}
                  className="
                    absolute
                    left-4
                    top-4
                    z-10
                    text-gray-400
                    group-focus-within:text-blue-600
                    dark:group-focus-within:text-cyan-400
                    transition-all
                    duration-300
                  "
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3
                    rounded-xl
                    border
                    outline-none
                    appearance-none
                    bg-white
                    dark:bg-[#111827]
                    border-gray-300
                    dark:border-gray-700
                    text-gray-900
                    dark:text-white
                  "
                >
                  <option value="user">User</option>
                  <option value="institute">Institute</option>
                  <option value="verifier">Verifier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  py-3
                  rounded-xl
                  font-semibold
                  text-white
                  bg-blue-600
                  hover:bg-blue-700
                  shadow-lg
                  hover:scale-[1.02]
                  transition-all
                  duration-300
                "
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            
            <p className="text-center mt-6 text-gray-600 dark:text-gray-300">
              <Link
                to="/forgot-password"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </p>

            <p className="text-center mt-2 text-gray-600 dark:text-gray-300">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Register
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;