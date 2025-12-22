const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneOfParents: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  grade: { type: String },
  gender: { type: String, enum: ["Male", "Female"] },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
