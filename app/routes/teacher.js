const express = require("express");
const router = express.Router();

const authorize = require("../middlewares/authorize");

const teacherController = require("../controllers/teacher/Classes");
const { showMySubjects } = require("../controllers/teacher/Subjects");

const {
  showTeacherStudentsPage,
  getTeacherSectionsByClass,
  getTeacherStudentsBySection,
  showStudentDetails,
} = require("../controllers/teacher/Students");

const {
  showAddExamPage,
  getSectionsByClass,
  createExam,
  showExamList,
  showExamDetails,
  showGradesPage,
  saveGrades,
} = require("../controllers/teacher/Exams");

// ==================================================
// Teacher Authorization (Protect All Routes)
// ==================================================
router.use(authorize(["teacher"]));

// ==================================================
// Classes
// ==================================================
router.get("/classes", teacherController.showTeacherClasses);
router.get("/classes/:classId/sections", getTeacherSectionsByClass);

// ==================================================
// Subjects
// ==================================================
router.get("/subjects", showMySubjects);

// ==================================================
// Students
// ==================================================
router.get("/students", showTeacherStudentsPage);
router.post("/students/data", getTeacherStudentsBySection);
router.get("/students/:id", showStudentDetails);

// ==================================================
// Exams
// ==================================================

// Add Exam
router.get("/exams/add", showAddExamPage);
router.get("/classes/:classId/sections", getSectionsByClass);
router.post("/exams/add", createExam);

// Exams List & Details
router.get("/exams", showExamList);
router.get("/exams/:examId", showExamDetails);

// Grades
router.get("/exams/:id/grades", showGradesPage);
router.post("/exams/:id/grades", saveGrades);

module.exports = router;
