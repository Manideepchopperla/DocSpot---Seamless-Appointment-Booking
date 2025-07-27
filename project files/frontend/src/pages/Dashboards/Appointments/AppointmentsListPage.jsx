import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Link } from 'react-router-dom';
import { Calendar, User, Stethoscope, Clock } from 'lucide-react';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const AppointmentCard = ({ appt, userRole }) => (
    <div className="bg-white p-5 rounded-2xl shadow-lg h-full flex flex-col">
        <div className="flex items-center gap-4">
            {userRole === 'user' ? (
                <div className="p-3 bg-blue-100 rounded-full"><Stethoscope className="text-blue-600 w-6 h-6"/></div>
            ) : (
                <div className="p-3 bg-green-100 rounded-full"><User className="text-green-600 w-6 h-6"/></div>
            )}
            <div>
                <p className="text-sm text-gray-500">{userRole === 'user' ? 'With Doctor' : 'Patient'}</p>
                <h3 className="font-bold text-lg text-gray-800">
                    {userRole === 'user' ? appt.doctor?.user?.name : appt.patient?.name}
                </h3>
            </div>
        </div>
        
        <div className="my-4 pt-4 border-t border-dashed space-y-2 text-gray-700">
            <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-500" />
                <span>{formatDate(appt.date)}</span>
            </div>
            <div className="flex items-center gap-3">
                <Clock size={16} className="text-gray-500" />
                <span>{appt.time}</span>
            </div>
        </div>

        <div className="mt-auto text-center">
             <span className={`w-full inline-block px-4 py-2 text-sm font-semibold rounded-lg ${
                appt.status === 'approved' ? 'bg-green-100 text-green-800' :
                appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                appt.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
                Status: {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </span>
        </div>
    </div>
);


export default function AppointmentsListPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState('confirmed');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get('/appointments', { headers: { 'x-auth-token': token } })
            .then(res => setAppointments(res.data))
            .catch(() => setError('Failed to fetch appointments.'))
            .finally(() => setLoading(false));
    }, [token]);
    
    const confirmedAppointments = appointments.filter(a => a.status === 'approved' || a.status === 'completed');
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const rejectedAppointments = appointments.filter(a => a.status === 'rejected');

    if (loading) return <div className="text-center">Loading appointments...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    const renderGrid = (list, isClickable) => {
        if (list.length === 0) {
            return <p className="bg-white col-span-full p-6 rounded-lg shadow-sm text-gray-500">No appointments in this category.</p>;
        }
        return list.map((appt) => {
            if (isClickable) {
                return (
                    <Link to={`${appt._id}`} key={appt._id} className="transform hover:-translate-y-1 transition-transform duration-300">
                        <AppointmentCard appt={appt} userRole={user.role} />
                    </Link>
                );
            } else {
                 return (
                    <div key={appt._id} className="opacity-70 cursor-not-allowed" title="No further action can be taken.">
                        <AppointmentCard appt={appt} userRole={user.role} />
                    </div>
                );
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
                <div className="flex items-center bg-gray-200 p-1 rounded-full">
                    <button
                        onClick={() => setActiveView('confirmed')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                            activeView === 'confirmed' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600'
                        }`}
                    >
                        Upcoming & Past
                    </button>
                    <button
                        onClick={() => setActiveView('pending')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors relative ${
                            activeView === 'pending' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600'
                        }`}
                    >
                        Pending
                        {pendingAppointments.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                                    {pendingAppointments.length}
                                </span>
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveView('rejected')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                            activeView === 'rejected' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600'
                        }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {activeView === 'confirmed' && renderGrid(confirmedAppointments, true)}
                 {activeView === 'pending' && renderGrid(pendingAppointments, false)}
                 {activeView === 'rejected' && renderGrid(rejectedAppointments, false)}
            </div>
        </div>
    );
}