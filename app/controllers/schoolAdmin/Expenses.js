const{
    Expense,
} = require("./utils");

// عرض كل الصادرات
exports.listExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      schoolId: req.user.schoolId,
      source: "school"
    }).sort({ createdAt: -1 });

    res.render("dashboard/school-admin/expense/expenses", { expenses });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الصادرات");
    res.redirect("/dashboard");
  }
};


// صفحة إضافة صادر جديد
exports.renderAddExpenseForm = (req, res) => {
  res.render("dashboard/school-admin/expense/add-expense");
};

// إنشاء صادر جديد
exports.createExpense = async (req, res) => {
  try {
    const { amount, category, description } = req.body;

    const expense = new Expense({
      amount,
      category,
      description,
      schoolId: req.user.schoolId,
      source: "school" // 👈 مهم جدًا
    });

    await expense.save();

    res.json({
      success: "تم إضافة الصادر بنجاح",
      redirect: "/school-admin/expenses"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      errors: { general: "حدث خطأ أثناء إضافة الصادر" }
    });
  }
};


// صفحة تعديل الصادر
exports.renderEditExpenseForm = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (
      !expense ||
      expense.schoolId.toString() !== req.user.schoolId.toString() ||
      expense.source !== "school"
    ) {
      req.flash("error", "غير مصرح لك بتعديل هذا الصادر");
      return res.redirect("/school-admin/expenses");
    }

    res.render("dashboard/school-admin/expense/edit-expense", { expense });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الصادر");
    res.redirect("/school-admin/expenses");
  }
};


// تحديث الصادر
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (
      !expense ||
      expense.schoolId.toString() !== req.user.schoolId.toString() ||
      expense.source !== "school"
    ) {
      return res.status(403).json({
        errors: { general: "غير مصرح لك بتعديل هذا الصادر" }
      });
    }

    expense.amount = req.body.amount;
    expense.category = req.body.category;
    expense.description = req.body.description;

    await expense.save();

    res.json({
      success: "تم تحديث الصادر بنجاح",
      redirect: "/school-admin/expenses"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      errors: { general: "حدث خطأ أثناء تحديث الصادر" }
    });
  }
};

// عرض تفاصيل الصادر
exports.viewExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (
      !expense ||
      expense.schoolId.toString() !== req.user.schoolId.toString() ||
      expense.source !== "school"
    ) {
      req.flash("error", "غير مصرح لك بعرض هذا الصادر");
      return res.redirect("/school-admin/expenses");
    }

    res.render("dashboard/school-admin/expense/view-expense", { expense });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الصادر");
    res.redirect("/school-admin/expenses");
  }
};
