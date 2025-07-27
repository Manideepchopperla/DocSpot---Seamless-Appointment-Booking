const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const cloudinary = require('../config/cloudinary');
const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/docModel');
const User = require('../models/userModel');
const { check, validationResult } = require('express-validator');


// @route   GET api/appointments/:id
// @desc    Get a single appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email avatar')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .populate('documents.uploadedBy', 'name');

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Authorization check: Ensure the user is part of the appointment
    const isPatient = appointment.patient._id.toString() === req.user.id;
    const isDoctor = appointment.doctor.user._id.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/appointments/:id/upload
// @desc    Upload a document to an appointment
// @access  Private
router.post('/:id/upload', [auth, upload.single('document')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor');

    if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Authorization check
    const isPatient = appointment.patient.toString() === req.user.id;
    const isDoctor = appointment.doctor.user.toString() === req.user.id;
    if (!isPatient && !isDoctor) {
        return res.status(401).json({ msg: 'User not authorized' });
    }

    // Upload file to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'docspot_documents',
      resource_type: 'auto', // Allows uploading PDFs, images, etc.
    });

    // Create a new document entry
    const newDocument = {
      url: result.secure_url,
      filename: req.file.originalname,
      uploadedBy: req.user.id
    };

    appointment.documents.push(newDocument);
    await appointment.save();

    // Populate the uploader's name for the response
    await appointment.populate('documents.uploadedBy', 'name');

    res.json(appointment);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', [auth, [
    check('doctor', 'Doctor is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty()
  ]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { doctor, date, time } = req.body;

      // Check if doctor exists and is approved
      const doctorExists = await Doctor.findOne({ _id: doctor, isApproved: true });
      if (!doctorExists) {
        return res.status(404).json({ msg: 'Doctor not found or not approved' });
      }

      // Check slot conflict
      const appointmentDate = new Date(date);
      const existingAppointment = await Appointment.findOne({
        doctor,
        date: {
          $gte: new Date(appointmentDate.setHours(0, 0, 0)),
          $lt: new Date(appointmentDate.setHours(23, 59, 59))
        },
        time,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existingAppointment) {
        return res.status(400).json({ msg: 'This time slot is already booked' });
      }

      // Create appointment
      const appointment = new Appointment({
        patient: req.user.id,
        doctor,
        date,
        time,
        status: 'pending'
      });

      await appointment.save();
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


  // @route   GET api/appointments
  // @desc    Get all appointments for the logged in user (patient or doctor)
  // @access  Private
  router.get('/', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      let appointments;
      
      if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ user: req.user.id });
        
        if (!doctor) {
          return res.status(404).json({ msg: 'Doctor profile not found' });
        }
        
        appointments = await Appointment.find({ doctor: doctor._id })
          .populate('patient', ['name', 'email', 'phone'])
          .sort({ date: 1 });
      } else {
        appointments = await Appointment.find({ patient: req.user.id })
          .populate({
            path: 'doctor',
            populate: {
              path: 'user',
              select: 'name email phone'
            }
          })
          .sort({ date: 1 });
      }
      
      res.json(appointments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // @route   PUT api/appointments/:id
  // @desc    Update appointment status
  // @access  Private
  router.put('/:id', auth, async (req, res) => {
    try {
      const { status, prescription, notes } = req.body;
      const appointment = await Appointment.findById(req.params.id);
      
      if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
      }
      
      // Verify ownership or doctor status
      const user = await User.findById(req.user.id);
      const isDoctor = user.role === 'doctor';
      const isPatient = appointment.patient.toString() === req.user.id;
      
      if (isDoctor) {
        const doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
          return res.status(401).json({ msg: 'Not authorized' });
        }
      } else if (!isPatient) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Update appointment
      if (status) appointment.status = status;
      if (prescription && isDoctor) appointment.prescription = prescription;
      if (notes) appointment.notes = notes;
      
      await appointment.save();
      
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // @route   POST api/appointments/available-slots
// @desc    Get available time slots for a doctor on a specific date
// @access  Private
router.post('/available-slots', auth, async (req, res) => {
    try {
        const { doctorId, date } = req.body;

        if (!doctorId || !date) {
            return res.status(400).json({ msg: 'Doctor ID and date are required.' });
        }

        // Define doctor's working hours/slots for a standard day
        // (This could be moved to a config file or the doctor's profile in a more complex app)
        const standardSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
        ];

        // Find appointments already booked for that doctor on that day
        const searchDate = new Date(date);
        
        const startOfDay = new Date(searchDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setUTCHours(23, 59, 59, 999));

        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            status: { $in: ['approved', 'pending'] }
        });

        const bookedTimes = bookedAppointments.map(appt => appt.time);

        // Filter the standard slots to find which ones are available
        const availableSlots = standardSlots.filter(slot => !bookedTimes.includes(slot));

        res.json(availableSlots);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

  // @route   GET api/appointments/available/:doctorId/:date
  // @desc    Get available time slots for a doctor on a specific date
  // @access  Private
  router.get('/available/:doctorId/:date', auth, async (req, res) => {
    try {
      const { doctorId, date } = req.params;
      
      // Get doctor's available time slots
      const doctor = await Doctor.findById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ msg: 'Doctor not found' });
      }
      
      const availableTimeSlots = doctor.availableTimeSlots;
      
      // Get booked appointments for the date
      const appointmentDate = new Date(date);
      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        date: {
          $gte: new Date(appointmentDate.setHours(0, 0, 0)),
          $lt: new Date(appointmentDate.setHours(23, 59, 59))
        },
        status: { $in: ['pending', 'confirmed'] }
      }).select('timeSlot');
      
      // Filter out booked time slots
      const bookedTimeSlots = bookedAppointments.map(app => app.timeSlot);
      const availableSlots = availableTimeSlots.filter(slot => 
        !bookedTimeSlots.some(bookedSlot => 
          bookedSlot.start === slot.start && bookedSlot.end === slot.end
        )
      );
      
      res.json(availableSlots);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;