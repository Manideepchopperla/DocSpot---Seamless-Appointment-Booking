// src/pages/Dashboards/Profile/ProfilePage.jsx
import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { UploadCloud, Save } from 'lucide-react';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/auth/me', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data.user);
        setAvatarPreview(res.data.user.avatar);
        if (res.data.doctor) {
          setDoctor({
            ...res.data.doctor,
            qualifications: (res.data.doctor.qualifications || []).join(', '),
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleDoctorChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // 1. Upload avatar if a new one is selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await axios.post('/upload/profile-picture', formData, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // 2. Update user profile data
      await axios.put('/auth/users/me', {
        name: user.name,
        phone: user.phone,
        address: user.address,
      }, { headers: { 'x-auth-token': token } });
      
      // 3. Update doctor profile data if applicable
      if (user.role === 'doctor' && doctor) {
        await axios.put('/auth/doctors/me', {
            ...doctor,
            qualifications: doctor.qualifications.split(',').map(q => q.trim())
        }, { headers: { 'x-auth-token': token } });
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Refresh localstorage user data to reflect changes in header
      const updatedUserRes = await axios.get('/auth/me', { headers: { 'x-auth-token': token } });
      localStorage.setItem('user', JSON.stringify(updatedUserRes.data.user));
      window.dispatchEvent(new Event('storage')); // Notify other components of storage change

    } catch (err) {
      console.error('Profile update failed:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Your Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={avatarPreview}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <label
              htmlFor="avatar-upload"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg cursor-pointer hover:bg-blue-200 transition"
            >
              <UploadCloud size={20} />
              Change Picture
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* User Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8">
          <InputField label="Full Name" name="name" value={user.name} onChange={handleUserChange} placeholder="Your full name" />
          <InputField label="Phone Number" name="phone" value={user.phone} onChange={handleUserChange} placeholder="+91 98765 43210" />
          <InputField label="Address" name="address" value={user.address} onChange={handleUserChange} placeholder="Your full address" />
        </div>

        {/* Doctor-Specific Fields */}
        {user.role === 'doctor' && doctor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8">
             <InputField label="Specialty" name="specialty" value={doctor.specialty} onChange={handleDoctorChange} placeholder="e.g., Cardiology" />
             <InputField label="Years of Experience" name="experience" type="number" value={doctor.experience} onChange={handleDoctorChange} placeholder="e.g., 10" />
             <InputField label="Consultation Fee (INR)" name="consultationFee" type="number" value={doctor.consultationFee} onChange={handleDoctorChange} placeholder="e.g., 500" />
             <InputField label="Qualifications (comma-separated)" name="qualifications" value={doctor.qualifications} onChange={handleDoctorChange} placeholder="MBBS, MD" />
             <div className="md:col-span-2">
                 <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                 <textarea id="bio" name="bio" value={doctor.bio} onChange={handleDoctorChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="A brief introduction about yourself..."></textarea>
             </div>
          </div>
        )}

        {/* Message and Submit Button */}
        <div className="flex items-center justify-between border-t pt-6">
          <div>
            {message.text && (
              <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}