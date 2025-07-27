// src/pages/Dashboards/CustomerDashboard.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';

// A simple component to show on the main dashboard route
const DashboardHome = () => (
    <div className="bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to your Dashboard</h1>
        <p className="mt-2 text-gray-600">
            Use the sidebar to find doctors, view your upcoming appointments, or update your profile.
        </p>
    </div>
);

export default function CustomerDashboard() {
  const location = useLocation();

  // This component now acts as a layout wrapper for all customer routes
  // The actual content for sub-routes will be rendered via the <Outlet />
  // We can decide to show a default component if we are on the base path
  const isBaseCustomerPath = location.pathname === '/user-dashboard';

  return (
    <DashboardLayout role="user">
      {isBaseCustomerPath ? <DashboardHome /> : <Outlet />}
    </DashboardLayout>
  );
}