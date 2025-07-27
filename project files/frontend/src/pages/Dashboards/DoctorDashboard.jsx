// src/pages/Dashboards/DoctorDashboard.jsx
import { Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const DashboardHome = () => (
  <div className="bg-white p-8 rounded-xl shadow-md">
    <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
    <p className="mt-2 text-gray-600">
      View your appointment schedule and manage your professional profile.
    </p>
  </div>
);

export default function DoctorDashboard() {
  const location = useLocation();
  const isBaseDoctorPath = location.pathname === '/doctor-dashboard';

  return (
    <DashboardLayout role="doctor">
      {isBaseDoctorPath ? <DashboardHome /> : <Outlet />}
    </DashboardLayout>
  );
}