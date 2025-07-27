import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// NEW: Import the ProtectedRoute component
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboards & Sub-pages
import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import DoctorDashboard from "./pages/Dashboards/DoctorDashboard";
import CustomerDashboard from "./pages/Dashboards/CustomerDashboard";
import ProfilePage from "./pages/Dashboards/Profile/ProfilePage";
import AppointmentsListPage from "./pages/Dashboards/Appointments/AppointmentsListPage";
import AppointmentDetailsPage from "./pages/Dashboards/Appointments/AppointmentDetailsPage";
import FindDoctorsPage from "./pages/Dashboards/FindDoctors/FindDoctorsPage";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}

        {/* Admin Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
      
          </Route>
        </Route>
        
        {/* Doctor Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/doctor-dashboard" element={<DoctorDashboard />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="appointments" element={<AppointmentsListPage />} />
            <Route path="appointments/:id" element={<AppointmentDetailsPage />} />
          </Route>
        </Route>
        
        {/* Customer Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/user-dashboard" element={<CustomerDashboard />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="appointments" element={<AppointmentsListPage />} />
            <Route path="appointments/:id" element={<AppointmentDetailsPage />} />
            <Route path="doctors" element={<FindDoctorsPage />} /> 
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;