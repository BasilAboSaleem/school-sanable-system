const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher/Classes');

// صفحة عرض الفصول والشعب للمعلم
router.get('/classes',  teacherController.showTeacherClasses);

module.exports = router;
