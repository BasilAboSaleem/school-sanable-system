const express = require("express");
const router = express.Router();

const authorize = require("../middlewares/authorize");
const attendanceController = require("../controllers/attendance");

// ==================================================
// Attendance Authorization (Protect All Routes)
// ==================================================
router.use(authorize(["attendance"]));

// ==================================================
// Attendance Registration
// ==================================================
router.get("/register", attendanceController.showRegisterPage);
router.post("/save", attendanceController.saveAttendance);

// ==================================================
// Data Fetching (AJAX)
// ==================================================

// جلب الشعب حسب الفصل
router.get("/sections/:classId", attendanceController.getSectionsByClass);

// جلب الطلاب حسب الشعبة
router.get("/students/:sectionId", attendanceController.getStudentsBySection);

// ==================================================
// Attendance Logs
// ==================================================
router.get("/logs", attendanceController.showAttendanceLogs);
router.post("/logs/data", attendanceController.getAttendanceLogs);

module.exports = router;
