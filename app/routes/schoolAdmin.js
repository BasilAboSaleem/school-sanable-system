const express = require("express");
const router = express.Router();
const schoolAdminController = require("../controllers/schoolAdmin");

// Routes for Class Management
router.get("/classes/create", schoolAdminController.renderCreateClassForm);
router.post("/classes/create", schoolAdminController.createClass);
router.get("/classes", schoolAdminController.listClasses);
router.get("/classes/:id/edit", schoolAdminController.renderEditClassForm);
router.post("/classes/:id/edit", schoolAdminController.updateClass);



// Routes for Section Management
router.get("/sections/create", schoolAdminController.renderCreateSectionForm);
router.post("/sections/create", schoolAdminController.createSection);
router.get("/classes/:classId/sections", schoolAdminController.listSectionsByClass);

// Routes for Teacher Management
router.get("/teachers/create", schoolAdminController.renderCreateTeacherForm);
router.post("/teachers/create", schoolAdminController.createTeacher);
router.get("/teachers", schoolAdminController.listTeachers);
router.get("/teachers/:id/edit", schoolAdminController.renderEditTeacherForm);
router.post("/teachers/:id/edit", schoolAdminController.updateTeacher);


// Routes for Subject Management
router.get("/subjects/create", schoolAdminController.renderCreateSubjectForm);
router.post("/subjects/create", schoolAdminController.createSubject);
router.get("/subjects", schoolAdminController.listSubjects);
router.get("/subjects/:id/edit", schoolAdminController.renderEditSubjectForm);
router.post("/subjects/:id/edit", schoolAdminController.updateSubject);

module.exports = router; 