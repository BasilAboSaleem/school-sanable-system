const mongoose = require("mongoose");

const teacherSubjectSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  }
}, { timestamps: true });

// منع تكرار نفس التكليف
teacherSubjectSchema.index(
  { teacherId: 1, subjectId: 1, sectionId: 1 },
  { unique: true }
);

module.exports = mongoose.model("TeacherSubject", teacherSubjectSchema);
