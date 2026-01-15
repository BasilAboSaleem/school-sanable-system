const e = require("connect-flash");
const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const Section = require("../models/Section");
const Student = require("../models/Student");
const ParentProfile = require("../models/ParentProfile");
const Grade = require("../models/Grade");

const mongoose = require("mongoose");

exports.getMyStudents = async (req, res) => {
  try {
    // جلب ParentProfile الخاص بالمستخدم الحالي
    const parentProfile = await ParentProfile.findOne({ userId: req.user._id })
      .populate({
        path: 'students',
        populate: [
          { path: 'schoolId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' }
        ]
      });

    if (!parentProfile) {
      // إذا لم يوجد Profile، نرسل مصفوفة فارغة
      return res.render('parent/my-students', { students: [] });
    }

    const students = parentProfile.students || [];

    res.render('dashboard/parent/my-students', { students });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الطلاب");
    res.redirect('/');
  }
};

exports.getStudentDetails = async (req, res) => {
try {
    const studentId = req.params.id;

    // جلب ولي الأمر الحالي
    const parentProfile = await ParentProfile.findOne({ userId: req.user._id });

    if (!parentProfile) {
      req.flash("error", "حساب ولي الأمر غير صالح");
      return res.redirect("/");
    }

    // التحقق أن الطالب تابع لهذا الولي
    if (!parentProfile.students.some(id => id.toString() === studentId)) {
      req.flash("error", "لا يمكنك عرض بيانات هذا الطالب");
      return res.redirect("/parent/students");
    }

    // جلب بيانات الطالب مع الفصل والشعبة
    const student = await Student.findById(studentId)
      .populate("classId")
      .populate("sectionId")
      .lean();

    if (!student) {
      req.flash("error", "الطالب غير موجود");
      return res.redirect("/parent/students");
    }

    // جلب العلامات الخاصة بالطالب
    const grades = await Grade.find({ studentId: student._id, schoolId: student.schoolId })
      .populate("subjectId")
      .populate("examId")
      .populate("teacherId")
      .populate("classId")
      .populate("sectionId")
      .sort({ createdAt: -1 })
      .lean();

    res.render("dashboard/parent/student-details", { student, grades });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الطالب");
    res.redirect("/");
  }
};
