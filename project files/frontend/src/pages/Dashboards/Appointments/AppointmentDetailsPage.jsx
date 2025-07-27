// src/pages/Dashboards/Appointments/AppointmentDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import { Calendar, Clock, User, Stethoscope, Paperclip, Upload, FileText } from 'lucide-react';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function AppointmentDetailsPage() {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const res = await axios.get(`/appointments/${id}`, { headers: { 'x-auth-token': token } });
                setAppointment(res.data);
            } catch (err) {
                setError('Failed to fetch appointment details.');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [id, token]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('document', file);
        try {
            const res = await axios.post(`/appointments/${id}/upload`, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAppointment(res.data); // Update state with the new appointment data
            setFile(null); // Clear the file input
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!appointment) return <div>Appointment not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Appointment Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Appointment Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div className="flex items-center gap-3"><Stethoscope className="text-blue-500" /> <strong>Doctor:</strong> {appointment.doctor.user.name}</div>
                    <div className="flex items-center gap-3"><User className="text-blue-500" /> <strong>Patient:</strong> {appointment.patient.name}</div>
                    <div className="flex items-center gap-3"><Calendar className="text-blue-500" /> <strong>Date:</strong> {formatDate(appointment.date)}</div>
                    <div className="flex items-center gap-3"><Clock className="text-blue-500" /> <strong>Time:</strong> {appointment.time}</div>
                </div>
                 <div className="mt-4 pt-4 border-t">
                     <p className="flex items-center gap-3"><strong>Status:</strong> <span className={`px-3 py-1 text-sm font-semibold rounded-full ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{appointment.status}</span></p>
                 </div>
            </div>

            {/* Shared Documents Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Shared Documents</h2>
                <div className="space-y-3 mb-6">
                    {appointment.documents.length > 0 ? (
                        appointment.documents.map(doc => (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-blue-600"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">{doc.filename}</p>
                                        <p className="text-xs text-gray-500">Uploaded by {doc.uploadedBy.name} on {formatDate(doc.uploadedAt)}</p>
                                    </div>
                                </div>
                                <Paperclip className="text-gray-400"/>
                            </a>
                        ))
                    ) : (
                        <p className="text-gray-500">No documents have been shared for this appointment yet.</p>
                    )}
                </div>

                {/* Upload Section */}
                <div className="pt-6 border-t">
                     <h3 className="font-semibold text-gray-800 mb-2">Upload a new document</h3>
                     <div className="flex flex-col sm:flex-row gap-4">
                         <input type="file" onChange={handleFileChange} className="flex-grow p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                         <button onClick={handleUpload} disabled={!file || uploading} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition">
                             {uploading ? 'Uploading...' : <><Upload size={18}/> Upload File</>}
                         </button>
                     </div>
                </div>
            </div>
        </div>
    );
}