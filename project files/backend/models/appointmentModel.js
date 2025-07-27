const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    url: { type: String, required: true },
    filename: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected',"completed"],
      default: "pending",
    },
    documents: [documentSchema]
  },
  {
    timestamps: true,
  }
);

const Appointment = new mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
