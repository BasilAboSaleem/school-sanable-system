const mongoose = require("mongoose");

const parentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optional: ensure unique ParentProfile per (user + school)
parentProfileSchema.index({ userId: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model("ParentProfile", parentProfileSchema);
