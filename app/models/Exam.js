const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  // نوع الاختبار بدل التايتل
  type: {
    type: String,
    enum: ["monthly", "midterm", "final", "quiz"],
    required: true
  },

  // العلامة القصوى للاختبار
  maxScore: {
    type: Number,
    required: true,
    default: 20 // مثال: إذا ما تم تحديد العلامة تكون 20
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
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String // ملف الامتحان (PDF / DOCX)
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
