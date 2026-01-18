const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const Section = require("../models/Section");
const Student = require("../models/Student");
const mongoose = require("mongoose");

// صفحة تسجيل الحضور
exports.showRegisterPage = async (req, res) => {
  const classes = await Class.find({ schoolId: req.user.schoolId });
  res.render("dashboard/attendance/register", { classes });
};

const getUTCDayRange = (date = new Date()) => {
  const start = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  const end = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));

  return { start, end };
};


// جلب الشعب
exports.getSectionsByClass = async (req, res) => {
  try {
    const sections = await Section.find({ classId: req.params.classId });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: "فشل جلب الشعب" });
  }
};

// جلب الطلاب + منع التحميل إذا مسجّل
exports.getStudentsBySection = async (req, res) => {
  try {
    const { start, end } = getUTCDayRange();
    const sectionId = req.params.sectionId;

    const attendanceExists = await Attendance.findOne({
      schoolId: req.user.schoolId,
      sectionId,
      date: { $gte: start, $lte: end }
    });

    if (attendanceExists) {
      return res.json({
        alreadyRecorded: true,
        message: "تم تسجيل الحضور اليومي لهذه الشعبة سابقاً"
      });
    }

    const students = await Student.find({ sectionId });
    res.json({ students });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل جلب الطلاب" });
  }
};


// حفظ الحضور

exports.saveAttendance = async (req, res) => {
  const { attendances } = req.body;

  if (!attendances || attendances.length === 0) {
    return res.json({ error: "لا توجد بيانات للحفظ" });
  }

  try {
    const { start, end } = getUTCDayRange();
    const { classId, sectionId } = attendances[0];

    const exists = await Attendance.findOne({
      schoolId: req.user.schoolId,
      classId,
      sectionId,
      date: { $gte: start, $lte: end }
    });

    if (exists) {
      return res.status(400).json({
        error: "تم تسجيل الحضور لهذه الشعبة اليوم مسبقاً"
      });
    }

    const docs = attendances.map(a => ({
      studentId: a.studentId,
      schoolId: req.user.schoolId,
      classId: a.classId,
      sectionId: a.sectionId,
      date: new Date(), // UTC تلقائياً
      status: a.status,
      reason: a.reason || "",
      notes: a.notes || "",
      recordedBy: req.user._id
    }));

    await Attendance.insertMany(docs);

    res.json({ success: "تم تسجيل الحضور بنجاح" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ أثناء حفظ الحضور" });
  }
};


// صفحة سجلات الحضور
exports.showAttendanceLogs = async (req, res) => {
  const classes = await Class.find({ schoolId: req.user.schoolId });

  res.render("dashboard/attendance/logs", { classes });
};



// جلب سجلات الحضور حسب الفلترة
// جلب سجلات الحضور حسب الفلترة
exports.getAttendanceLogs = async (req, res) => {
  const { classId, sectionId, date } = req.body;

  try {
    let filter = {
      schoolId: new mongoose.Types.ObjectId(req.user.schoolId)
    };

    if (classId) {
      filter.classId = new mongoose.Types.ObjectId(classId);
    }

    if (sectionId) {
      filter.sectionId = new mongoose.Types.ObjectId(sectionId);
    }

    if (date) {
      // ✅ توحيد المنطق مع باقي النظام (UTC)
      const { start, end } = getUTCDayRange(new Date(date));
      filter.date = { $gte: start, $lte: end };
    }

    const logs = await Attendance.find(filter)
      .populate("studentId", "fullName")
      .populate("classId", "name")
      .populate("sectionId", "name")
      .populate("recordedBy", "name")
      .sort({ date: -1 });

    res.json(logs);

  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};



