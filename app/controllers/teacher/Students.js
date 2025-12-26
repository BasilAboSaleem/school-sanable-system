const mongoose = require("mongoose");
const Section = require("../../models/Section");
const Student = require("../../models/Student");
const Exam = require("../../models/Exam");
const Subject = require("../../models/Subject");
const User = require("../../models/User");

/**
 * صفحة طلابي
 */
exports.showTeacherStudentsPage = async (req, res) => {
  try {
    const sections = await Section.find({
      _id: { $in: req.user.sections }
    }).populate("classId", "name");

    const classesMap = {};
    sections.forEach(sec => {
      classesMap[sec.classId._id.toString()] = sec.classId;
    });

    res.render("dashboard/teacher/students", {
      classes: Object.values(classesMap)
    });

  } catch (err) {
    console.error(err);
    res.render("dashboard/teacher/students", { classes: [] });
  }
};


/**
 * جلب الشعب حسب الفصل
 */
exports.getTeacherSectionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const sections = await Section.find({
      classId,
      _id: { $in: req.user.sections }
    }).select("name");

    res.json(sections);

  } catch (err) {
    console.error(err);
    res.json([]);
  }
};


/**
 * جلب الطلاب حسب الشعبة
 */
exports.getTeacherStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.body;

    const students = await Student.find({
      sectionId,
      status: "active"
    })
      .sort({ fullName: 1 })
      .select("fullName grade status");

    res.json(students);

  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

// صفحة عرض طالب
exports.showStudentDetails = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId)
      .populate("classId")
      .populate("sectionId");

    if (!student) return res.status(404).send("الطالب غير موجود"); 

    // جلب المواد التي يدرسها المعلم (المعلم الحالي هو req.user)
    const teacher = await User.findById(req.user._id); 
    const subjects = await Subject.find({ _id: { $in: teacher.subjects } });

    // جلب جميع الدرجات للطالب حسب المواد المرتبطة بالمعلم
    const exams = await Exam.find({
      studentId,
      subjectId: { $in: subjects.map(s => s._id) }
    }).populate("subjectId");

    res.render("dashboard/teacher/student-details", {
      student,
      subjects,
      exams
    });

  } catch (err) {
    console.error("showStudentDetails:", err);
    res.status(500).send("حدث خطأ أثناء جلب بيانات الطالب");
  }
};
