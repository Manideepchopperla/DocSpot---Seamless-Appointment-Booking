const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const Doctor = require('../models/docModel');
const auth = require('../middlewares/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'user',
      phone
    });

    await user.save();

    // If user is registering as doctor, create doctor profile
    if (role === 'doctor') {
      const { specialty, experience, qualifications, bio, consultationFee } = req.body;
      
      const doctor = new Doctor({
        user: user._id,
        specialty,
        experience,
        qualifications,
        bio,
        consultationFee,
        
      });

      await doctor.save();
    }

    // Return jsonwebtoken
    const token = user.getSignedJwtToken();

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Return jsonwebtoken
    const token = user.getSignedJwtToken();

    res.json({ token,user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id })
        .populate('user', '-password'); // Populate user details for doctor
      return res.json({ user, doctor });
    }
    
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// Update user profile
router.put('/users/me', auth, async (req, res) => {
  const { name, phone,email, address } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.email = email || user.email;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update doctor profile
router.put('/doctors/me', auth, async (req, res) => {
  const {
    specialty,
    experience,
    qualifications,
    bio,
    consultationFee
  } = req.body;

  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ msg: "Doctor profile not found" });

    doctor.specialty = specialty || doctor.specialty;
    doctor.experience = experience || doctor.experience;
    doctor.qualifications = qualifications || doctor.qualifications;
    doctor.bio = bio || doctor.bio;
    doctor.consultationFee = consultationFee || doctor.consultationFee;

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});




module.exports = router;