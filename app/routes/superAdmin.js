const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdmin");

router.get("/schools/add", superAdminController.getAddSchool);
router.post("/schools/add", superAdminController.postAddSchool);

// عرض جميع المدارس
router.get("/schools", superAdminController.listSchools);

// عرض مدرسة واحدة
router.get("/schools/:id/view", superAdminController.viewSchool);

// تعديل مدرسة
router.get("/schools/:id/edit", superAdminController.editSchoolForm);
router.post("/schools/:id/edit", superAdminController.updateSchool);

// List all school admins
router.get('/school-admins', superAdminController.listSchoolAdmins);

// View a school admin
router.get('/school-admins/:id/view', superAdminController.viewSchoolAdmin);

// Edit a school admin
router.get('/school-admins/:id/edit', superAdminController.editSchoolAdminForm);
router.post('/school-admins/:id/edit', superAdminController.updateSchoolAdmin);

// عرض جميع الواردات
router.get("/incomes", superAdminController.listIncomes);

// صفحة إضافة وارد جديد (يمكن أن يكون المورد جديد)
router.get("/incomes/create", superAdminController.renderAddIncome);
router.post("/incomes/create", superAdminController.createIncome);

// صفحة عرض وارد لتوزيعه
router.get("/incomes/:id/view", superAdminController.viewIncomeDetails);

// توزيع وارد على المدارس
router.post("/incomes/:id/distribute", superAdminController.distributeIncome);

// تعديل وارد
router.get("/incomes/:id/edit", superAdminController.renderEditIncome);
router.post("/incomes/:id/edit", superAdminController.updateIncome);


// عرض كل الصادرات
router.get("/expenses", superAdminController.listExpenses);

// صفحة إضافة صادر جديد
router.get("/expenses/create", superAdminController.renderAddExpense);
router.post("/expenses/create", superAdminController.createExpense);

// صفحة عرض صادر
router.get("/expenses/:id/view", superAdminController.viewExpenseDetails);
// صادرات المدارس (تقارير)
router.get(
  "/school-expenses",
  superAdminController.listSchoolExpenses
);

// تعديل صادر
router.get("/expenses/:id/edit", superAdminController.renderEditExpense);
router.post("/expenses/:id/edit", superAdminController.updateExpense);

router.get("/dashboard-financials", superAdminController.dashboardFinancials);

module.exports = router;