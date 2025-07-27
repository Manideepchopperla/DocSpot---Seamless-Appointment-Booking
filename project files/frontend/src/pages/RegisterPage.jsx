import { useState, memo } from "react";
import { motion } from "framer-motion";
import { User, UserCheck, Stethoscope, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from '../api/axios';

// Optimized Field component
const Field = memo(({ id, label, name, value, onChange, ...rest }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="font-medium">{label}</label>
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      {...rest}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 transition"
    />
  </div>
));

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("patient");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialty: '',
    experience: '',
    bio: '',
    consultationFee: '',
    qualifications: '',

  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = '/auth/register'; // ← FIXED
      const response = await axios.post(endpoint, {
        ...formData,
        role: activeTab === "patient" ? "user" : "doctor",
      });
      window.location.href = '/login';
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Join DocSpot</h1>
              <p className="text-xl text-gray-600">
                Create your account and start your healthcare journey
              </p>
            </div>

            <form
              key={activeTab}
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white/80 backdrop-blur shadow-2xl p-8"
            >
              <div className="grid grid-cols-2 mb-8">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 py-2 rounded-t-lg border-b-2 ${
                    activeTab === "patient"
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("patient")}
                >
                  <User size={16} /> Patient
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 py-2 rounded-t-lg border-b-2 ${
                    activeTab === "doctor"
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("doctor")}
                >
                  <Stethoscope size={16} /> Doctor
                </button>
              </div>

              {activeTab === "patient" && (
                <motion.div
                  key="patient"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <Field id="name" name="name" label="Name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                  <Field id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                  <Field id="phone" name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                  <Field id="password" name="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />

                  <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-medium shadow-lg hover:from-blue-700 hover:to-cyan-700 transition"
                  >
                    Create Patient Account
                    <UserCheck size={20} />
                  </button>
                </motion.div>
              )}

              {activeTab === "doctor" && (
                <motion.div
                  key="doctor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <Field id="name" name="name" label="Name" value={formData.name} onChange={handleChange} placeholder="Dr. Jane Smith" />
                  <Field id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} placeholder="dr.smith@hospital.com" />
                  
                  <div className="space-y-2">
                    <label className="font-medium">Specialty</label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select your specialty</option>
                      {["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"].map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </div>

                  <Field id="consultationFee" name="consultationFee" label="Consultation Fee" value={formData.consultationFee} onChange={handleChange} placeholder="₹ 500" />
                  <Field id="qualifications" name="qualifications" label="Qualifications" value={formData.qualifications} onChange={handleChange} placeholder="MBBS" />
                  <Field id="experience" name="experience" label="Years of Experience" type="number" value={formData.experience} onChange={handleChange} placeholder="10" />

                  <div className="space-y-2">
                    <label htmlFor="bio" className="font-medium">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Tell us about yourself and your medical background..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Field id="password" name="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />

                  <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-medium shadow-lg hover:from-blue-700 hover:to-cyan-700 transition"
                  >
                    Submit for Approval
                    <Stethoscope size={20} />
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    Doctor accounts require admin approval before activation
                  </p>
                </motion.div>
              )}

              <p className="mt-8 text-center text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
