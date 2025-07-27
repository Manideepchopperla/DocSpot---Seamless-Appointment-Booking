const mongoose = require("mongoose");
const validator = require("validator");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    specialty: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true
    },
    qualifications: {
      type: [String],
      required: true
    },
    bio: {
      type: String,
      required: true
    },
    consultationFee: {
      type: Number,
      required: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = new mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
