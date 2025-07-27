// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const doctorRoutes = require('./routes/doctorRoute');
const appointmentRoutes = require('./routes/appointmentRoute');
const adminRoutes = require('./routes/adminRoute');
const uploadRoutes = require('./routes/uploadRoute'); // <-- ADDED

const app = express();

require('dotenv').config();

app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://doc-spot-seamless-appointment-booki.vercel.app'
  ],
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});