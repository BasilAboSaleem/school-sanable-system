const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // المعلم المسؤول عن الشعبة
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Section", sectionSchema);
