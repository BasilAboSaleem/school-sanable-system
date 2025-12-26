const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance");

// صفحة تسجيل الحضور
router.get("/register", attendanceController.showRegisterPage);

// جلب الشعب حسب الفصل
router.get("/sections/:classId", attendanceController.getSectionsByClass);

// جلب الطلاب حسب الشعبة
router.get("/students/:sectionId", attendanceController.getStudentsBySection);

// حفظ الحضور دفعة واحدة
router.post("/save", attendanceController.saveAttendance);

// صفحة سجلات الحضور
router.get("/logs", attendanceController.showAttendanceLogs);

// جلب سجلات حسب الفلترة (AJAX)
router.post("/logs/data", attendanceController.getAttendanceLogs);


module.exports = router;
