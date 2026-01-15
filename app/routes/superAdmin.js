const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdmin/superAdmin");
const authorize = require("../middlewares/authorize");
const schoolValidator = require("../validators/schoolValidator");

// ==================================================
// Super Admin Authorization (Protect All Routes)
// ==================================================
router.use(authorize(["super-admin"]));

// ==================================================
// Schools Management
// ==================================================
router.get("/schools/add", superAdminController.School.getAddSchool);
router.post("/schools/add", schoolValidator.validateAddSchool, superAdminController.School.postAddSchool);

// عرض جميع المدارس
router.get("/schools", superAdminController.School.listSchools);

// عرض مدرسة واحدة
router.get("/schools/:id/view", superAdminController.School.viewSchool);

// تعديل مدرسة
router.get("/schools/:id/edit", superAdminController.School.editSchoolForm);
router.post("/schools/:id/edit", schoolValidator.validateEditSchool, superAdminController.School.updateSchool);

// ==================================================
// School Admins Management
// ==================================================

// List all school admins
router.get("/school-admins", superAdminController.schoolAdmins.listSchoolAdmins);

// View a school admin
router.get("/school-admins/:id/view", superAdminController.schoolAdmins.viewSchoolAdmin);

// Edit a school admin
router.get("/school-admins/:id/edit", superAdminController.schoolAdmins.editSchoolAdminForm);
router.post("/school-admins/:id/edit", superAdminController.schoolAdmins.updateSchoolAdmin);

// ==================================================
// Incomes Management
// ==================================================

const financeValidator = require("../validators/financeValidator");

// ==================================================
// Incomes Management
// ==================================================

// عرض جميع الواردات
router.get("/incomes", superAdminController.Income.listIncomes);

// صفحة إضافة وارد جديد
router.get("/incomes/create", superAdminController.Income.renderAddIncome);
router.post("/incomes/create", financeValidator.validateIncome, superAdminController.Income.createIncome);

// عرض وارد واحد
router.get("/incomes/:id/view", superAdminController.Income.viewIncomeDetails);

// توزيع وارد
router.post("/incomes/:id/distribute", superAdminController.Income.distributeIncome);

// تعديل وارد
router.get("/incomes/:id/edit", superAdminController.Income.renderEditIncome);
router.post("/incomes/:id/edit", financeValidator.validateIncome, superAdminController.Income.updateIncome);

// عرض جميع الواردات الخاصة بالمدارس
router.get("/schools/incomes", superAdminController.Income.viewAllSchoolIncomes);

// ==================================================
// Expenses & Financial Reports
// ==================================================

// عرض كل الصادرات
router.get("/expenses", superAdminController.Expense.listInstitutionExports);

// ❌ صفحات إضافة / تعديل / عرض الصادرات (مقفلة مؤقتًا)
// router.get("/expenses/create", superAdminController.Expense.renderAddExpense);
// router.post("/expenses/create", superAdminController.Expense.createExpense);
// router.get("/expenses/:id/view", superAdminController.Expense.viewExpenseDetails);
// router.get("/expenses/:id/edit", superAdminController.Expense.renderEditExpense);
// router.post("/expenses/:id/edit", superAdminController.Expense.updateExpense);

// صادرات المدارس (تقارير)
router.get(
  "/school-expenses",
  superAdminController.Expense.listSchoolExpenses
);

// ==================================================
// Dashboard & Suppliers
// ==================================================
router.get(
  "/dashboard-financials",
  superAdminController.dashboardFinancials.dashboardFinancials
);

router.get("/suppliers", superAdminController.Supplier.renderSuppliers);

// عرض واردات مورد محدد
router.get(
  "/suppliers/:id/incomes",
  superAdminController.Supplier.renderSupplierIncomes
);

module.exports = router;
