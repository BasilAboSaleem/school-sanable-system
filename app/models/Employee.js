const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  nationalId: {
    type: String,
    trim: true,
    // unique: true, // فعّلها إذا حاب تمنع التكرار
  },

  phone: {
    type: String,
    trim: true
  },

  jobTitle: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    default: "-"
  },

  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Employee", employeeSchema);
