// routes/uploadRoute.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/userModel');

router.post('/profile-picture', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    // Upload image to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'docspot_avatars',
      width: 150,
      height: 150,
      crop: 'fill',
    });

    // Update user's avatar URL in the database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');
    
    res.json({
      msg: 'Profile picture uploaded successfully',
      avatarUrl: user.avatar,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;