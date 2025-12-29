const{
    Income,
    Supplier
, Expense
} = require("./utils");


// Render Add Income Form
exports.renderAddIncomeForm = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ schoolId: req.user.schoolId });
    res.render("dashboard/school-admin/income/add-income", { suppliers });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load suppliers");
    res.redirect("/school-admin/incomes");
  }
};

// Add Income
exports.addIncome = async (req, res) => {
  try {
    const { amount, supplierId, description } = req.body;

    if (!amount || !supplierId) {
      return res.status(400).json({ errors: { general: "Amount and Supplier are required" } });
    }

    const income = new Income({
      amount,
      supplierId,
      description,
      schoolId: req.user.schoolId,
    });

    await income.save();
    return res.json({ success: "Income added successfully", redirect: "/school-admin/incomes" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: { general: "Error adding income" } });
  }
};

// List All Incomes
// List All Incomes
exports.listIncomes = async (req, res) => {
  try {
    // جلب كل الواردات للمدرسة أو الواردات المحولة من السوبر أدمن
    const incomes = await Income.find({
      $or: [
        { schoolId: req.user.schoolId }, // واردات المدرسة نفسها
        { schoolId: null } // واردات السوبر أدمن التي تحولت للمدرسة
      ]
    })
    .populate("supplierId")
    .sort({ createdAt: -1 });

    res.render("dashboard/school-admin/income/list-incomes", { incomes });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load incomes");
    res.redirect("/dashboard");
  }
};

// Render Edit Income Form
exports.renderEditIncomeForm = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    const suppliers = await Supplier.find({ schoolId: req.user.schoolId });

    if (!income) {
      req.flash("error", "Income not found");
      return res.redirect("/school-admin/incomes");
    }

    res.render("dashboard/school-admin/income/edit-income", { income, suppliers });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading income");
    res.redirect("/school-admin/incomes");
  }
};

// Update Income
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ errors: { general: "الوارد غير موجود" } });
    }

    income.supplierId = req.body.supplierId || income.supplierId;
    income.amount = req.body.amount || income.amount;
    income.description = req.body.description || income.description;

    await income.save();

    // Send JSON response for AJAX
    res.json({ success: "Income updated successfully", redirect: "/school-admin/incomes" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: { general: "حدث خطأ أثناء تحديث الوارد" } });
  }
};

// View Income Details
exports.viewIncomeDetails = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id)
      .populate("supplierId");

    if (!income) {
      req.flash("error", "الوارد غير موجود");
      return res.redirect("/school-admin/incomes");
    }

    // ✅ فقط صادرات هذا الوارد + هذه المدرسة
    const distributedExpenses = await Expense.find({
      incomeId: income._id,
      schoolId: req.user.schoolId
    }).sort({ createdAt: -1 });

    const totalDistributed = distributedExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const remainingAmount = income.amount - totalDistributed;

    res.render("dashboard/school-admin/income/view-income", {
      income,
      distributedExpenses,
      totalDistributed,
      remainingAmount,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ");
    res.redirect("/school-admin/incomes");
  }
};




