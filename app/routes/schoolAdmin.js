const express = require("express");
const router = express.Router();
const schoolAdminController = require("../controllers/schoolAdmin/schoolAdmin");

// Routes for Class Management
router.get("/classes/create", schoolAdminController.Class.renderCreateClassForm);
router.post("/classes/create", schoolAdminController.Class.createClass);
router.get("/classes", schoolAdminController.Class.listClasses);
router.get("/classes/:id/edit", schoolAdminController.Class.renderEditClassForm);
router.post("/classes/:id/edit", schoolAdminController.Class.updateClass);


// Routes for Section Management
router.get("/sections/create", schoolAdminController.Section.renderCreateSectionForm);
router.post("/sections/create", schoolAdminController.Section.createSection);
router.get("/classes/:classId/sections", schoolAdminController.Section.listSectionsByClass);
router.get(
  "/classes/:classId/sections/json",
  schoolAdminController.Section.getSectionsByClassJSON
)

// Routes for Teacher Management
router.get("/teachers/create", schoolAdminController.Teacher.renderCreateTeacherForm);
router.post("/teachers/create", schoolAdminController.Teacher.createTeacher);
router.get("/teachers", schoolAdminController.Teacher.listTeachers);
router.get("/teachers/:id/edit", schoolAdminController.Teacher.renderEditTeacherForm);
router.post("/teachers/:id/edit", schoolAdminController.Teacher.updateTeacher);


// Routes for Subject Management
router.get("/subjects/create", schoolAdminController.Subject.renderCreateSubjectForm);
router.post("/subjects/create", schoolAdminController.Subject.createSubject);
router.get("/subjects", schoolAdminController.Subject.listSubjects);
router.get("/subjects/:id/edit", schoolAdminController.Subject.renderEditSubjectForm);
router.post("/subjects/:id/edit", schoolAdminController.Subject.updateSubject);

// Routes for Student Management
router.get("/students/create", schoolAdminController.Student.renderCreateStudentForm);
router.post("/students/create", schoolAdminController.Student.createStudent);
router.get("/students", schoolAdminController.Student.listStudents);
router.get("/students/:id", schoolAdminController.Student.viewStudentDetails);
router.get("/students/:id/edit", schoolAdminController.Student.renderEditStudentForm);
router.post("/students/:id/edit", schoolAdminController.Student.updateStudent);

// Routes for Employee Management
router.get("/employees", schoolAdminController.Employee.listEmployees);
router.get("/employees/create", schoolAdminController.Employee.renderAddEmployeeForm);
router.post("/employees/create", schoolAdminController.Employee.createEmployee);

router.get("/employees/:id/edit", schoolAdminController.Employee.renderEditEmployeeForm);
router.post("/employees/:id/edit", schoolAdminController.Employee.updateEmployee);

router.get("/employees/:id/delete", schoolAdminController.Employee.deleteEmployee);


// الموردين
router.get("/suppliers", schoolAdminController.Supplier.listSuppliers);
router.get("/suppliers/create", schoolAdminController.Supplier.renderAddSupplierForm);
router.post("/suppliers/create", schoolAdminController.Supplier.createSupplier);
router.get("/suppliers/:id/edit", schoolAdminController.Supplier.renderEditSupplierForm);
router.post("/suppliers/:id/edit", schoolAdminController.Supplier.updateSupplier);
router.get("/suppliers/:id/delete", schoolAdminController.Supplier.deleteSupplier);
router.get("/suppliers/:id/view", schoolAdminController.Supplier.viewSupplierDetails);

// Incomes
router.get("/incomes", schoolAdminController.Income.listIncomes);
router.get("/incomes/create", schoolAdminController.Income.renderAddIncomeForm);
router.post("/incomes/create", schoolAdminController.Income.addIncome);
router.get("/incomes/:id/edit", schoolAdminController.Income.renderEditIncomeForm);
router.post("/incomes/:id/edit", schoolAdminController.Income.updateIncome);
router.get("/incomes/:id/view", schoolAdminController.Income.viewIncomeDetails);
router.get("/incomes/:id/delete", schoolAdminController.Income.deleteIncome);
// صفحة عرض كل الصادرات
router.get("/expenses", schoolAdminController.Expense.listExpenses);

// صفحة إضافة صادر
router.get("/expenses/create", schoolAdminController.Expense.renderAddExpenseForm);

// إنشاء صادر جديد (AJAX)
router.post("/expenses/create", schoolAdminController.Expense.createExpense);

// صفحة تعديل الصادر
router.get("/expenses/:id/edit", schoolAdminController.Expense.renderEditExpenseForm);

// تحديث الصادر (AJAX)
router.post("/expenses/:id/edit", schoolAdminController.Expense.updateExpense);

// صفحة عرض تفاصيل الصادر
router.get("/expenses/:id/view", schoolAdminController.Expense.viewExpense);

router.get(
  "/attendance-users/create",
  schoolAdminController.Attendance.renderCreateAttendanceUser
);


router.post(
  "/attendance-users/create",
  schoolAdminController.Attendance.createAttendanceUser
);

router.get('/attendance-users', schoolAdminController.Attendance.listAttendanceUsers);

router.get(
  '/attendance-users/:id/delete',
  schoolAdminController.Attendance.deleteAttendanceUser
);

router.get(
  '/attendance-users/:id/edit',
  schoolAdminController.Attendance.renderEditForm
);

router.post(
  '/attendance-users/:id/edit',
  schoolAdminController.Attendance.updateAttendanceUser
);
router.get('/sections/:sectionId/students', schoolAdminController.Section.listStudentsBySection);

module.exports = router;   