const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher/Classes');
const { showMySubjects } = require('../controllers/teacher/Subjects');
const { showTeacherStudentsPage,  getTeacherSectionsByClass,
     getTeacherStudentsBySection, showStudentDetails} = require('../controllers/teacher/Students');
     const { showAddExamPage, getSectionsByClass, createExam } = require("../controllers/teacher/Exams");

const { showExamList, showExamDetails ,showGradesPage, saveGrades } = require("../controllers/teacher/Exams");     

router.get("/exams/add", showAddExamPage);
router.get("/classes/:classId/sections", getSectionsByClass);
router.post("/exams/add", createExam);

router.get('/classes',  teacherController.showTeacherClasses);
router.get("/subjects", showMySubjects);
router.get("/students",  showTeacherStudentsPage);
router.get("/classes/:classId/sections",getTeacherSectionsByClass);
router.post("/students/data",getTeacherStudentsBySection);
router.get("/students/:id", showStudentDetails);

// قائمة الاختبارات
router.get("/exams", showExamList);

// تفاصيل الاختبار + كشف الدرجات
router.get("/exams/:examId", showExamDetails);

router.get('/exams/:id/grades', showGradesPage);
router.post('/exams/:id/grades', saveGrades);






module.exports = router;
