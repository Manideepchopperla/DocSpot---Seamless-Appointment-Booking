const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/userModel');
const Doctor = require('../models/docModel');
const Appointment = require('../models/appointmentModel');

// Middleware to check if user is admin
const adminCheck = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized as admin' });
    }
    
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/admin/doctors
// @desc    Get all doctors (including unapproved)
// @access  Admin
router.get('/doctors', [auth, adminCheck], async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', ['name', 'email', 'phone']);
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/doctors/:id/approve
// @desc    Approve or reject a doctor
// @access  Admin
router.put('/doctors/:id/approve', [auth, adminCheck], async (req, res) => {
  try {
    const { approve } = req.body;
    
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    
    doctor.isApproved = approve;
    await doctor.save();
    
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, adminCheck], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/appointments
// @desc    Get all appointments
// @access  Admin
router.get('/appointments', [auth, adminCheck], async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', ['name', 'email', 'phone'])
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ date: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// router.get('/user/appointments', [auth, adminCheck], async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const appointments = await Appointment.find({ patient: userId})
//       .populate('patient', ['name', 'email', 'phone'])
//       .populate({
//         path: 'doctor',
//         populate: {
//           path: 'user',
//           select: 'name email phone'
//         }
//       })
//       .sort({ date: 1 });
    
//     res.json(appointments);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });


// router.get('/doctor/appointments', [auth, adminCheck], async (req, res) => {
//   try {
//     const doctorId = req.user.id;
//     const appointments = await Appointment.find({ doctor: doctorId, status: 'approved' })
//       .populate('patient', ['name', 'email', 'phone'])
//       .populate({
//         path: 'doctor',
//         populate: {
//           path: 'user',
//           select: 'name email phone'
//         }
//       })
//       .sort({ date: 1 });
    
//     res.json(appointments);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// @route   PUT /api/admin/appointments/:id/approve
// @desc    Approve an appointment
// @access  Admin


router.put('/appointments/:id/approve', [auth, adminCheck], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    appointment.status = 'approved';
    await appointment.save();
    res.json({ msg: 'Appointment approved', appointment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/appointments/:id/reject
// @desc    Reject an appointment
// @access  Admin
router.put('/appointments/:id/reject', [auth, adminCheck], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    appointment.status = 'rejected';
    await appointment.save();
    res.json({ msg: 'Appointment rejected', appointment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/admin/stats
// @desc    Get app statistics
// @access  Admin
router.get('/stats', [auth, adminCheck], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDoctors = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    res.json({
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;