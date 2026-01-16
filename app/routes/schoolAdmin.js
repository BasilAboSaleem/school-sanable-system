const express = require("express");
const router = express.Router();

const authorize = require("../middlewares/authorize");
const schoolAdminController = require("../controllers/schoolAdmin/schoolAdmin");
const schoolAdminValidator = require("../validators/schoolAdminValidator");

// ==================================================
// School Admin Authorization (Protect All Routes)
// ==================================================
router.use(authorize(["school-admin", "school-coordinator"]));

// ==================================================
// Classes Management
// ==================================================
router.get("/classes/create", schoolAdminController.Class.renderCreateClassForm);
router.post("/classes/create", schoolAdminController.Class.createClass);
router.get("/classes", schoolAdminController.Class.listClasses);
router.get("/classes/:id/edit", schoolAdminController.Class.renderEditClassForm);
router.post("/classes/:id/edit", schoolAdminController.Class.updateClass);

// ==================================================
// Sections Management
// ==================================================
router.get("/sections/create", schoolAdminController.Section.renderCreateSectionForm);
router.post("/sections/create", schoolAdminController.Section.createSection);
router.get("/classes/:classId/sections", schoolAdminController.Section.listSectionsByClass);
router.get(
  "/classes/:classId/sections/json",
  schoolAdminController.Section.getSectionsByClassJSON
);
router.get(
  "/sections/:sectionId/students",
  schoolAdminController.Section.listStudentsBySection
);

// ==================================================
// Teachers Management
// ==================================================
router.get("/teachers/create", schoolAdminController.Teacher.renderCreateTeacherForm);
router.post("/teachers/create", schoolAdminController.Teacher.createTeacher);
router.get("/teachers", schoolAdminController.Teacher.listTeachers);
router.get("/teachers/:id/edit", schoolAdminController.Teacher.renderEditTeacherForm);
router.post("/teachers/:id/edit", schoolAdminController.Teacher.updateTeacher);

// ==================================================
// Subjects Management
// ==================================================
router.get("/subjects/create", schoolAdminController.Subject.renderCreateSubjectForm);
router.post("/subjects/create", schoolAdminController.Subject.createSubject);
router.get("/subjects", schoolAdminController.Subject.listSubjects);
router.get("/subjects/:id/edit", schoolAdminController.Subject.renderEditSubjectForm);
router.post("/subjects/:id/edit", schoolAdminController.Subject.updateSubject);

// ==================================================
// Students Management
// ==================================================
router.get("/students/create", schoolAdminController.Student.renderCreateStudentForm);
router.post("/students/create", schoolAdminController.Student.createStudent);
router.get("/students", schoolAdminController.Student.listStudents);
router.get("/students/:id", schoolAdminController.Student.viewStudentDetails);
router.get("/students/:id/edit", schoolAdminController.Student.renderEditStudentForm);
router.post("/students/:id/edit", schoolAdminController.Student.updateStudent);

// ==================================================
// Employees Management
// ==================================================
router.get("/employees", schoolAdminController.Employee.listEmployees);
router.get("/employees/create", schoolAdminController.Employee.renderAddEmployeeForm);
router.post("/employees/create", schoolAdminValidator.validateEmployee, schoolAdminController.Employee.createEmployee);
router.get("/employees/:id/edit", schoolAdminController.Employee.renderEditEmployeeForm);
router.post("/employees/:id/edit", schoolAdminValidator.validateEmployee, schoolAdminController.Employee.updateEmployee);
router.get("/employees/:id/delete", schoolAdminController.Employee.deleteEmployee);

// ==================================================
// Suppliers Management
// ==================================================
router.get("/suppliers", schoolAdminController.Supplier.listSuppliers);
router.get("/suppliers/create", schoolAdminController.Supplier.renderAddSupplierForm);
router.post("/suppliers/create", schoolAdminValidator.validateSupplier, schoolAdminController.Supplier.createSupplier);
router.get("/suppliers/:id/edit", schoolAdminController.Supplier.renderEditSupplierForm);
router.post("/suppliers/:id/edit", schoolAdminValidator.validateSupplier, schoolAdminController.Supplier.updateSupplier);
router.get("/suppliers/:id/delete", schoolAdminController.Supplier.deleteSupplier);
router.get("/suppliers/:id/view", schoolAdminController.Supplier.viewSupplierDetails);

// ==================================================
// Incomes Management
// ==================================================
router.get("/incomes", schoolAdminController.Income.listIncomes);
router.get("/incomes/create", schoolAdminController.Income.renderAddIncomeForm);
router.post("/incomes/create", schoolAdminController.Income.addIncome);
router.get("/incomes/:id/edit", schoolAdminController.Income.renderEditIncomeForm);
router.post("/incomes/:id/edit", schoolAdminController.Income.updateIncome);
router.get("/incomes/:id/view", schoolAdminController.Income.viewIncomeDetails);

// ==================================================
// Expenses (Partially Disabled)
// ==================================================

// router.get("/expenses", schoolAdminController.Expense.listExpenses);
// router.get("/expenses/create", schoolAdminController.Expense.renderAddExpenseForm);
// router.get("/expenses/:id/edit", schoolAdminController.Expense.renderEditExpenseForm);
// router.post("/expenses/:id/edit", schoolAdminController.Expense.updateExpense);
// router.get("/expenses/:id/view", schoolAdminController.Expense.viewExpense);

// إنشاء صادر جديد (AJAX)
router.post("/expenses/create", schoolAdminController.Expense.createExpense);

// ==================================================
// Attendance Users Management
// ==================================================
router.get(
  "/attendance-users/create",
  schoolAdminController.Attendance.renderCreateAttendanceUser
);
router.post(
  "/attendance-users/create",
  schoolAdminController.Attendance.createAttendanceUser
);
router.get(
  "/attendance-users",
  schoolAdminController.Attendance.listAttendanceUsers
);
router.get(
  "/attendance-users/:id/delete",
  schoolAdminController.Attendance.deleteAttendanceUser
);
router.get(
  "/attendance-users/:id/edit",
  schoolAdminController.Attendance.renderEditForm
);
router.post(
  "/attendance-users/:id/edit",
  schoolAdminController.Attendance.updateAttendanceUser
);

// ==================================================
// Attendance Logs
// ==================================================
router.get(
  "/attendance/logs",
  schoolAdminController.Attendance.renderAttendancePage
);
router.get(
  "/attendance/sections/:classId",
  schoolAdminController.Attendance.getSectionsByClassJSON
);
router.post(
  "/attendance/filter",
  schoolAdminController.Attendance.filterAttendance
);

// ==================================================
// Coordinators Management (School Admin ONLY)
// ==================================================

router.get(
  "/coordinator",
  authorize(["school-admin"]),
  schoolAdminController.Coordinator.index
);

router.get(
  "/coordinator/create",
  authorize(["school-admin"]),
  schoolAdminController.Coordinator.renderCreate
);

router.post(
  "/coordinator/create",
  authorize(["school-admin"]),
  schoolAdminValidator.validateCoordinator,
  schoolAdminController.Coordinator.create
);

router.get(
  "/coordinator/:id/edit",
  authorize(["school-admin"]),
  schoolAdminController.Coordinator.renderEdit
);

router.post(
  "/coordinator/:id/edit",
  authorize(["school-admin"]),
  schoolAdminValidator.validateCoordinator,
  schoolAdminController.Coordinator.update
);

router.get(
  "/coordinator/:id/delete",
  authorize(["school-admin"]),
  schoolAdminController.Coordinator.delete
);


module.exports = router;
