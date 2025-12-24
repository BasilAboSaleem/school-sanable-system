const{
    Expense,
    Supplier,
    Income,
    School
} = require("./utils");


// عرض  صادرات المؤسسة
exports.listExpenses = async (req, res) => {
  const expenses = await Expense.find({ source: "institution" })
    .populate("schoolId")
    .sort({ createdAt: -1 });

  res.render("dashboard/super-admin/expense/expenses", { expenses });
};

// صادرات المدارس (عرض فقط)
exports.listSchoolExpenses = async (req, res) => {
  const expenses = await Expense.find({ source: "school" })
    .populate("schoolId")
    .sort({ createdAt: -1 });

  res.render("dashboard/super-admin/expense/school-expenses", { expenses });
};
// صفحة إضافة صادر جديد
exports.renderAddExpense = async (req, res) => {
  const schools = await School.find();
  res.render("dashboard/super-admin/expense/add-expense", { schools });
};

// إنشاء صادر جديد
exports.createExpense = async (req, res) => {
  try {
    const { schoolId, amount, category, description } = req.body;

    const expense = new Expense({
      schoolId,
      amount,
      category,
      description,
      source: "institution"
    });
    await expense.save();

    res.json({ success: "Expense added successfully", redirect: "/super-admin/expenses" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error adding expense" } });
  }
};

// صفحة عرض تفاصيل صادر
exports.viewExpenseDetails = async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate("schoolId");
  res.render("dashboard/super-admin/expense/view-expense", { expense });
};

// صفحة تعديل صادر
exports.renderEditExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  const schools = await School.find();
  res.render("dashboard/super-admin/expense/edit-expense", { expense, schools });
};

// تحديث صادر
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    expense.schoolId = req.body.schoolId;
    expense.amount = req.body.amount;
    expense.category = req.body.category;
    expense.description = req.body.description;
    await expense.save();

    res.json({ success: "Expense updated successfully", redirect: "/super-admin/expenses" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error updating expense" } });
  }
};
