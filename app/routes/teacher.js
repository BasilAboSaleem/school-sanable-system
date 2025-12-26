const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher/Classes');
const { showMySubjects } = require('../controllers/teacher/Subjects');

// صفحة عرض الفصول والشعب للمعلم
router.get('/classes',  teacherController.showTeacherClasses);
router.get("/subjects", showMySubjects);


module.exports = router;
