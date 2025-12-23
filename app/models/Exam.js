const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  marks: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    score: { type: Number }
  }]
});

module.exports = mongoose.model("Exam", examSchema);
