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

// جلب الشعب حسب الفصل فقط
exports.getSectionsByClass = async (req, res) => {
  try {
    const sections = await Section.find({ classId: req.params.classId });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل جلب الشعب" });
  }
};

// جلب الطلاب حسب الشعبة
exports.getStudentsBySection = async (req, res) => {
  try {
    const students = await Student.find({ sectionId: req.params.sectionId });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل جلب الطلاب" });
  }
};

// حفظ الحضور دفعة واحدة
exports.saveAttendance = async (req, res) => {
  const { attendances, date } = req.body;
  try {
    const ops = attendances.map(a => ({
      updateOne: {
        filter: { studentId: a.studentId, date: new Date(date) },
        update: {
          studentId: a.studentId,
          schoolId: req.user.schoolId,
          classId: a.classId,
          sectionId: a.sectionId,
          date: new Date(date),
          status: a.status,
          reason: a.reason || "",
          notes: a.notes || "",
          recordedBy: req.user._id,
          recordedAt: new Date()
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);
    res.json({ success: "تم حفظ الحضور بنجاح" });
  } catch (err) {
    console.error(err);
    res.json({ error: "حدث خطأ أثناء الحفظ" });
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
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

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
    res.json([]);
  }
};


