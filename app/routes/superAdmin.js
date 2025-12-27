const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdmin/superAdmin");

router.get("/schools/add", superAdminController.School.getAddSchool);
router.post("/schools/add", superAdminController.School.postAddSchool);

// عرض جميع المدارس
router.get("/schools", superAdminController.School.listSchools);
// عرض مدرسة واحدة
router.get("/schools/:id/view", superAdminController.School.viewSchool);

// تعديل مدرسة
router.get("/schools/:id/edit", superAdminController.School.editSchoolForm);
router.post("/schools/:id/edit", superAdminController.School.updateSchool);

// List all school admins
router.get('/school-admins', superAdminController.schoolAdmins.listSchoolAdmins);
// View a school admin
router.get('/school-admins/:id/view', superAdminController.schoolAdmins.viewSchoolAdmin);

// Edit a school admin
router.get('/school-admins/:id/edit', superAdminController.schoolAdmins.editSchoolAdminForm);
router.post('/school-admins/:id/edit', superAdminController.schoolAdmins.updateSchoolAdmin);
// عرض جميع الواردات
router.get("/incomes", superAdminController.Income.listIncomes);

// صفحة إضافة وارد جديد (يمكن أن يكون المورد جديد)
router.get("/incomes/create", superAdminController.Income.renderAddIncome);
router.post("/incomes/create", superAdminController.Income.createIncome);

router.get("/incomes/:id/view", superAdminController.Income.viewIncomeDetails);

// توزيع وارد
router.post("/incomes/:id/distribute", superAdminController.Income.distributeIncome);

// تعديل وارد
router.get("/incomes/:id/edit", superAdminController.Income.renderEditIncome);
router.post("/incomes/:id/edit", superAdminController.Income.updateIncome);


// عرض كل الصادرات
router.get("/expenses", superAdminController.Expense.listInstitutionExports);

// صفحة إضافة صادر جديد
//router.get("/expenses/create", superAdminController.Expense.renderAddExpense);
//router.post("/expenses/create", superAdminController.Expense.createExpense);
// صفحة عرض صادر
//router.get("/expenses/:id/view", superAdminController.Expense.viewExpenseDetails);
// صادرات المدارس (تقارير)
router.get(
  "/school-expenses",
  superAdminController.Expense.listSchoolExpenses
);

// تعديل صادر
//router.get("/expenses/:id/edit", superAdminController.Expense.renderEditExpense);
//router.post("/expenses/:id/edit", superAdminController.Expense.updateExpense);

router.get("/dashboard-financials", superAdminController.dashboardFinancials.dashboardFinancials);
router.get("/suppliers", superAdminController.Supplier.renderSuppliers);

// عرض واردات مورد محدد
router.get("/suppliers/:id/incomes", superAdminController.Supplier.renderSupplierIncomes);
// عرض جميع الواردات الخاصة بالمدارس
router.get('/schools/incomes', superAdminController.Income.viewAllSchoolIncomes);


module.exports = router;