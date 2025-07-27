   import React, { useState } from "react";
   import { motion, AnimatePresence } from "framer-motion";
   import { FaUser , FaLock, FaUserShield } from "react-icons/fa";
   import axios from '../api/axios'; // Import the Axios instance

   const LoginPage = () => {
     const [role, setRole] = useState("user");
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [error, setError] = useState("");

     const handleLogin = async (e) => {
       e.preventDefault();

       const emailRegex = /\S+@\S+\.\S+/;

       if (!email || !password) {
         setError("All fields are required.");
         return;
       } else if (!emailRegex.test(email)) {
         setError("Enter a valid email address.");
         return;
       }

       setError(""); // Clear previous error

       try {
         const response = await axios.post('/auth/login', { email, password });
         // Store token in local storage or context
         localStorage.setItem('token', response.data.token);
         localStorage.setItem('user', JSON.stringify(response.data.user));
         // Redirect user based on role
         const role = response.data.user.role;
         if (role === 'admin') {
           window.location.href = '/admin-dashboard'; // Redirect to admin dashboard
         } else if (role === 'doctor') {
           window.location.href = '/doctor-dashboard'; // Redirect to doctor dashboard
         }
          else if (role === 'user') {
            window.location.href = '/user-dashboard'; // Redirect to user dashboard
          }
       } catch (err) {
         setError(err.response?.data?.msg || "Login failed");
       }
     };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-8">
      <div className="flex flex-col-reverse md:flex-row items-center gap-10 max-w-6xl w-full">
        
        {/* LEFT LOGIN FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`bg-white p-8 rounded-3xl shadow-2xl w-full md:w-1/2 border ${
            error ? "border-red-400" : "border-blue-100"
          }`}
        >
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Welcome Back</h2>

          {/* Animated Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-red-600 text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleLogin}
            className="space-y-5"
            initial={false}
            animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Email */}
            <div className="relative">
              <FaUser className="absolute top-3.5 left-3 text-blue-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3 text-blue-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Role */}
            {/* <div className="relative">
              <FaUserShield className="absolute top-3.5 left-3 text-blue-500" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="customer">Login as Customer</option>
                <option value="doctor">Login as Doctor</option>
                <option value="admin">Login as Admin</option>
              </select>
            </div> */}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition"
            >
              Sign In
            </motion.button>
          </motion.form>

          {/* Redirect */}
          <p className="text-sm text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full md:w-1/2"
        >
          <img
            src="/login-illustration.svg" // Replace with your image
            alt="Login illustration"
            className="w-full max-w-md mx-auto"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
