import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { FiTrendingUp, FiUserCheck, FiUsers, FiBarChart2 } from "react-icons/fi";
import axios from '../../api/axios';

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, usersRes, appointmentsRes] = await Promise.all([
          axios.get('/admin/doctors', { headers: { 'x-auth-token': token } }),
          axios.get('/admin/users', { headers: { 'x-auth-token': token } }),
          axios.get('/admin/appointments', { headers: { 'x-auth-token': token } })
        ]);

        setPendingDoctors(doctorsRes.data.filter(doc => doc.isApproved === false));
        const currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        setUsers(usersRes.data.filter(user => user._id !== currentUserId));
        setAppointments(appointmentsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
      }
    };

    fetchData();
  }, []);

  const handleApproveAppointment = async (appointmentId) => {
    try {
      await axios.put(`/admin/appointments/${appointmentId}/approve`, {}, {
        headers: { 'x-auth-token': token }
      });
      setAppointments(prev => prev.map(appt => appt._id === appointmentId ? { ...appt, status: 'approved' } : appt));
    } catch (error) {
      console.error("Error approving appointment:", error);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    try {
      await axios.put(`/admin/appointments/${appointmentId}/reject`, {}, {
        headers: { 'x-auth-token': token }
      });
      setAppointments(prev => prev.map(appt => appt._id === appointmentId ? { ...appt, status: 'Rejected' } : appt));
    } catch (error) {
      console.error("Error rejecting appointment:", error);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await axios.put(`/admin/doctors/${doctorId}/approve`, { approve: true },{
        headers: { 'x-auth-token': token }
      });
      setPendingDoctors(prev => prev.filter(doc => doc._id !== doctorId));
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await axios.put(`/admin/doctors/${doctorId}/approve`, { approve: false },{
        headers: { 'x-auth-token': token }
      });
      setPendingDoctors(prev => prev.filter(doc => doc._id !== doctorId));
    } catch (error) {
      console.error("Error rejecting doctor:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col transition-colors duration-300">
      <Header title="Admin Dashboard" onProfileClick={() => alert("Edit Profile")} />
      <div className="p-6 space-y-6">
        <div className="flex gap-4 flex-wrap justify-center">
          {["overview", "new Doctors", "appointments"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                t === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-indigo-600 hover:bg-gray-200"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow rounded-lg">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-3">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-gray-200">
                      <td className="p-3">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td className="capitalize">{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "new Doctors" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow rounded-lg">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-3">Name</th>
                    <th>Specialty</th>
                    <th>Experience</th>
                    <th>License</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((d) => (
                    <motion.tr
                      key={d._id}
                      whileHover={{ scale: 1.005 }}
                      className="border-b border-gray-200"
                    >
                      <td className="p-3">{d.user.name}</td>
                      <td>{d.specialty}</td>
                      <td>{d.experience}</td>
                      <td>{d.license}</td>
                      <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 space-x-2">
                        <button 
                          onClick={() => handleApprove(d._id)} 
                          className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(d._id)} 
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "appointments" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-semibold mb-4">Appointments</h2>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow rounded-lg">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt._id} className="border-b border-gray-200">
                      <td className="p-3">{appt.patient?.name}</td>
                      <td>{appt.doctor?.user?.name}</td>
                      <td>{new Date(appt.date).toLocaleDateString()}</td>
                      <td>{appt.time}</td>
                      <td>{appt.status}</td>
                      <td className="space-x-2">
                        {appt.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveAppointment(appt._id)}
                            className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Approve
                          </button>
                        )}
                        {appt.status !== 'Rejected' && (
                          <button
                            onClick={() => handleRejectAppointment(appt._id)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
