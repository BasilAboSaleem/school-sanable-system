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
router.get(
  "/classes/:classId/sections/json",
  schoolAdminController.getSectionsByClassJSON
)

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

// Routes for Student Management
router.get("/students/create", schoolAdminController.renderCreateStudentForm);
router.post("/students/create", schoolAdminController.createStudent);
router.get("/students", schoolAdminController.listStudents);
router.get("/students/:id", schoolAdminController.viewStudentDetails);
router.get("/students/:id/edit", schoolAdminController.renderEditStudentForm);
router.post("/students/:id/edit", schoolAdminController.updateStudent);

// Routes for Employee Management
router.get("/employees", schoolAdminController.listEmployees);
router.get("/employees/create", schoolAdminController.renderAddEmployeeForm);
router.post("/employees/create", schoolAdminController.createEmployee);

router.get("/employees/:id/edit", schoolAdminController.renderEditEmployeeForm);
router.post("/employees/:id/edit", schoolAdminController.updateEmployee);

router.get("/employees/:id/delete", schoolAdminController.deleteEmployee);


// الموردين
router.get("/suppliers", schoolAdminController.listSuppliers);
router.get("/suppliers/create", schoolAdminController.renderAddSupplierForm);
router.post("/suppliers/create", schoolAdminController.createSupplier);
router.get("/suppliers/:id/edit", schoolAdminController.renderEditSupplierForm);
router.post("/suppliers/:id/edit", schoolAdminController.updateSupplier);
router.get("/suppliers/:id/delete", schoolAdminController.deleteSupplier);
router.get("/suppliers/:id/view", schoolAdminController.viewSupplierDetails);


module.exports = router; 