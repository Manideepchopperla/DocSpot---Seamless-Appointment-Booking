import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Stethoscope, Search, CheckCircle, Loader2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

export default function FindDoctorsPage() {
    // Component State
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Booking State
    const [bookingDoctorId, setBookingDoctorId] = useState(null);
    const [bookingDate, setBookingDate] = useState(undefined); // Use undefined for react-day-picker
    const [bookingTime, setBookingTime] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');

    // Availability State
    const [monthlyAvailability, setMonthlyAvailability] = useState({});
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const token = localStorage.getItem('token');

    // Fetch all doctors on initial load
    useEffect(() => {
        axios.get('/doctors')
            .then(res => {
                setDoctors(res.data);
                setFilteredDoctors(res.data);
            })
            .catch(() => setError('Could not fetch doctor information.'))
            .finally(() => setLoading(false));
    }, []);

    // Filter doctors when search term changes
    useEffect(() => {
        const results = doctors.filter(doc =>
            doc.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDoctors(results);
    }, [searchTerm, doctors]);

    // Fetch monthly availability when a doctor is selected or month changes
    useEffect(() => {
        if (bookingDoctorId) {
            setAvailabilityLoading(true);
            axios.get(`/doctors/${bookingDoctorId}/availability`, {
                params: { year: currentMonth.getFullYear(), month: currentMonth.getMonth() },
                headers: { 'x-auth-token': token }
            })
            .then(res => setMonthlyAvailability(res.data))
            .catch(() => console.error("Could not fetch monthly availability"))
            .finally(() => setAvailabilityLoading(false));
        }
    }, [bookingDoctorId, currentMonth, token]);

    // Fetch time slots for a specific day when a date is selected
    useEffect(() => {
        if (bookingDate && bookingDoctorId) {
            setSlotsLoading(true);
            setAvailableSlots([]);
            setBookingTime('');
            axios.post('/appointments/available-slots', {
                doctorId: bookingDoctorId,
                date: format(bookingDate, 'yyyy-MM-dd')
            }, { headers: { 'x-auth-token': token } })
            .then(res => setAvailableSlots(res.data))
            .catch(() => console.error("Could not fetch slots"))
            .finally(() => setSlotsLoading(false));
        }
    }, [bookingDate, bookingDoctorId, token]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        // ... (booking submission logic remains the same)
        setBookingMessage('');
        if (!bookingDate || !bookingTime) {
            setBookingMessage('Please select a date and time.');
            return;
        }
        try {
            await axios.post('/appointments', {
                doctor: bookingDoctorId,
                date: format(bookingDate, 'yyyy-MM-dd'),
                time: bookingTime,
            }, { headers: { 'x-auth-token': token } });
            setBookingMessage('Appointment booked successfully!');
            setTimeout(() => {
                setBookingDoctorId(null);
                setBookingMessage('');
            }, 3000);
        } catch (err) {
            setBookingMessage(err.response?.data?.msg || 'Failed to book appointment.');
        }
    };

    const disabledDays = [
        { before: new Date() }, // Disable past dates
        (date) => {
            const dateString = format(date, 'yyyy-MM-dd');
            // Disable if availability data is loaded and slots for that day are 0
            return monthlyAvailability.hasOwnProperty(dateString) && monthlyAvailability[dateString] <= 0;
        }
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
            {/* ... Search Bar ... */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by doctor's name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? <div className="text-center">Loading doctors...</div> :
             error ? <div className="text-center text-red-500">{error}</div> :
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDoctors.map(doctor => (
                    <div key={doctor._id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6">
                            {/* ... Doctor Info ... */}
                             <div className="flex items-center gap-4">
                                <img src={doctor.user.avatar} alt={doctor.user.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{doctor.user.name}</h2>
                                    <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 space-y-2">
                                <p><strong>Experience:</strong> {doctor.experience} years</p>
                                <p><strong>Fee:</strong> ₹{doctor.consultationFee}</p>
                            </div>
                        </div>

                        <div className="px-6 pb-6 mt-auto">
                            {bookingDoctorId !== doctor._id ? (
                                <button
                                    onClick={() => {
                                        setBookingDoctorId(doctor._id);
                                        setBookingDate(undefined);
                                        setBookingTime('');
                                        setAvailableSlots([]);
                                    }}
                                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                                >
                                    Book Appointment
                                </button>
                            ) : (
                                <form onSubmit={handleBookAppointment} className="bg-blue-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-center text-gray-800">Select a Date</h4>
                                    
                                    {/* Custom Calendar Component */}
                                    <div className="flex justify-center bg-white rounded-md border p-2">
                                       {availabilityLoading ? <div className="flex items-center gap-2 py-10"><Loader2 className="animate-spin"/>Loading Calendar...</div> :
                                        <DayPicker
                                            mode="single"
                                            selected={bookingDate}
                                            onSelect={setBookingDate}
                                            disabled={disabledDays}
                                            month={currentMonth}
                                            onMonthChange={setCurrentMonth}
                                            footer={<p className="text-xs text-center text-gray-500 pt-2">You can select {bookingDate ? format(bookingDate, 'PPP') : 'a day'}.</p>}
                                        />}
                                    </div>

                                    {/* Available Slots Section */}
                                    {bookingDate && (
                                        <div className="space-y-2">
                                            <h5 className="font-semibold text-sm text-gray-700">Available Slots for {format(bookingDate, 'MMM d')}:</h5>
                                            {slotsLoading ? <div className="flex justify-center items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={16}/></div> :
                                            <div className="grid grid-cols-3 gap-2">
                                                {availableSlots.length > 0 ? availableSlots.map(slot => (
                                                    <button key={slot} type="button" onClick={() => setBookingTime(slot)} className={`p-2 text-xs rounded-md transition ${bookingTime === slot ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'}`}>
                                                        {slot}
                                                    </button>
                                                )) : <p className="col-span-3 text-xs text-center text-gray-500">No slots available for this day.</p>}
                                            </div>}
                                        </div>
                                    )}

                                    {bookingMessage && <p className={`text-sm text-center font-medium ${bookingMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{bookingMessage}</p>}
                                    <div className="flex gap-2 pt-2 border-t">
                                        <button type="button" onClick={() => setBookingDoctorId(null)} className="w-1/2 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
                                        <button type="submit" disabled={!bookingTime} className="w-1/2 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-1 disabled:bg-gray-400">
                                            <CheckCircle size={16}/> Confirm
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                ))}
            </div>}
        </div>
    );
}