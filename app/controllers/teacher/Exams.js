const mongoose = require("mongoose");

const Exam = require("../../models/Exam");
const Class = require("../../models/Class");
const Section = require("../../models/Section");
const Subject = require("../../models/Subject");
const User = require("../../models/User");
const Grade = require("../../models/Grade");
const Student = require("../../models/Student"); 

exports.showAddExamPage = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate("classes").populate("subjects");

    res.render("dashboard/teacher/add-exam", {
      classes: teacher.classes,
      subjects: teacher.subjects
    });

  } catch (err) {
    console.error("showAddExamPage:", err);
    res.status(500).send("حدث خطأ أثناء جلب البيانات");
  }
};

exports.getSectionsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const teacher = await User.findById(req.user._id);

    // جلب الشعب المرتبطة بالفصل والتي المعلم مرتبط فيها
    const sections = await Section.find({
      _id: { $in: teacher.sections },
      classId
    });

    res.json(sections);

  } catch (err) {
    console.error("getSectionsByClass:", err);
    res.json([]);
  }
};

exports.createExam = async (req, res) => {
  try {
    const { type, maxScore, classId, sectionId, subjectId, examDate, fileUrl } = req.body;

    if (!type || !maxScore || !classId || !sectionId || !subjectId || !examDate) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const exam = new Exam({
      type,
      maxScore,
      classId,
      sectionId,
      subjectId,
      teacherId: req.user._id,
      examDate,
      fileUrl: fileUrl || "",
      schoolId: req.user.schoolId
    });

    await exam.save();

    res.json({ success: "تم إضافة الاختبار بنجاح" });

  } catch (err) {
    console.error("createExam:", err);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الاختبار" });
  }
};

// عرض قائمة الاختبارات
exports.showExamList = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const exams = await Exam.find({ teacherId })
      .populate("classId sectionId subjectId")
      .sort({ examDate: -1 });

    res.render("dashboard/teacher/list-exams", { exams });
  } catch (err) {
    console.error("showExamList:", err);
    res.render("dashboard/teacher/list-exams", { exams: [], error: "حدث خطأ أثناء جلب الاختبارات" });
  }
};

// عرض تفاصيل الاختبار + كشف الدرجات
exports.showExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId)
      .populate("classId sectionId subjectId teacherId");

    if (!exam) return res.status(404).send("Exam not found");

    const today = new Date();
    const isUpcoming = exam.examDate > today;

    let studentsWithGrades = [];
    if (!isUpcoming) {
      const students = await Student.find({ classId: exam.classId, sectionId: exam.sectionId })
        .sort({ fullName: 1 });
      const grades = await Grade.find({ examId: exam._id });

      studentsWithGrades = students.map(s => {
        const grade = grades.find(g => g.studentId.toString() === s._id.toString());
        return {
          ...s.toObject(),
          score: grade ? grade.score : null,
          notes: grade ? grade.notes : ""
        };
      });
    }

    res.render("dashboard/teacher/details-exam", { exam, isUpcoming, studentsWithGrades });
  } catch (err) {
    console.error("showExamDetails:", err);
    res.status(500).send("حدث خطأ أثناء جلب بيانات الاختبار");
  }
};

/* صفحة رصد الدرجات */
exports.showGradesPage = async (req,res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("classId sectionId subjectId");

    const students = await Student.find({
      classId: exam.classId,
      sectionId: exam.sectionId,
      status: "active"
    }).sort({ fullName: 1 });

    const grades = await Grade.find({ examId: exam._id });

    const map = {};
    grades.forEach(g => {
      map[g.studentId.toString()] = g;
    });

    const merged = students.map(s => ({
      ...s.toObject(),
      score: map[s._id]?.score ?? null,
      notes: map[s._id]?.notes ?? ""
    }));

    res.render("dashboard/teacher/grades", {
      exam,
      students: merged
    });

  } catch (err) {
    console.error(err);
    res.redirect("/teacher/exams");
  }
};

/* حفظ / تعديل الدرجات */
exports.saveGrades = async (req,res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    const entries = Object.entries(req.body);

    for (const [key,value] of entries) {
      if (!key.startsWith("score_")) continue;

      const studentId = key.split("_")[1];
      const score = Number(value);
      const notes = req.body[`notes_${studentId}`] || "";

      if (isNaN(score)) continue;

      await Grade.findOneAndUpdate(
        { studentId, examId: exam._id },
        {
          studentId,
          examId: exam._id,
          subjectId: exam.subjectId,
          teacherId: exam.teacherId,
          classId: exam.classId,
          sectionId: exam.sectionId,
          schoolId: exam.schoolId,
          score,
          notes
        },
        { upsert: true }
      );
    }

    res.json({ message: "تم حفظ الدرجات بنجاح" });

  } catch (err) {
    console.error(err);
    res.json({ message: "حدث خطأ" });
  }
};
