const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middlewares/auth');
const Doctor = require('../models/docModel');
const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');



// @route   GET api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: true })
      .populate('user', ['name', 'email', 'phone','avatar']);
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', ['name', 'email', 'phone']);

    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/doctors
// @desc    Create or update doctor profile
// @access  Private
router.post('/', [auth, [
  check('specialty', 'Specialty is required').not().isEmpty(),
  check('experience', 'Experience is required').not().isEmpty(),
  check('qualifications', 'Qualifications are required').not().isEmpty(),
  check('bio', 'Bio is required').not().isEmpty(),
  check('consultationFee', 'Consultation fee is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if user is a doctor
  const user = await User.findById(req.user.id);
  if (user.role !== 'doctor') {
    return res.status(401).json({ msg: 'Not authorized as doctor' });
  }

  const {
    specialty,
    experience,
    qualifications,
    bio,
    consultationFee,
  } = req.body;

  // Build doctor profile object
  const doctorFields = {};
  doctorFields.user = req.user.id;
  if (specialty) doctorFields.specialty = specialty;
  if (experience) doctorFields.experience = experience;
  if (qualifications) doctorFields.qualifications = qualifications;
  if (bio) doctorFields.bio = bio;
  if (consultationFee) doctorFields.consultationFee = consultationFee;

  try {
    let doctor = await Doctor.findOne({ user: req.user.id });

    if (doctor) {
      // Update
      doctor = await Doctor.findOneAndUpdate(
        { user: req.user.id },
        { $set: doctorFields },
        { new: true }
      );

      return res.json(doctor);
    }

    // Create
    doctor = new Doctor(doctorFields);
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/doctors/filter
// @desc    Filter doctors by specialty, availability, etc.
// @access  Public
router.get('/filter', async (req, res) => {
  try {
    const { specialty, minFee, maxFee } = req.query;
    const query = { isApproved: true };

    if (specialty) query.specialty = specialty;
    
    if (minFee && maxFee) {
      query.consultationFee = { $gte: minFee, $lte: maxFee };
    } else if (minFee) {
      query.consultationFee = { $gte: minFee };
    } else if (maxFee) {
      query.consultationFee = { $lte: maxFee };
    }

    const doctors = await Doctor.find(query)
      .populate('user', ['name', 'email', 'phone']);
    
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id/availability', auth, async (req, res) => {
    try {
        const { year, month } = req.query; // e.g., year=2025, month=6 (for July, as it's 0-indexed)

        if (!year || !month) {
            return res.status(400).json({ msg: 'Year and month are required.' });
        }
        
        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, parseInt(month) + 1, 0, 23, 59, 59, 999));
        
        const standardSlotsPerDay = 15; // From our previous implementation

        // Get all appointments for the doctor in the given month
        const appointments = await Appointment.find({
            doctor: req.params.id,
            date: { $gte: startDate, $lte: endDate },
            status: { $in: ['approved', 'pending'] }
        });

        // Group appointments by date
        const bookingsByDate = {};
        appointments.forEach(appt => {
            const dateString = appt.date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            if (!bookingsByDate[dateString]) {
                bookingsByDate[dateString] = 0;
            }
            bookingsByDate[dateString]++;
        });

        const availability = {};
        // Calculate available slots for each day of the month
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const bookedSlots = bookingsByDate[dateString] || 0;
            availability[dateString] = standardSlotsPerDay - bookedSlots;
        }

        res.json(availability);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;