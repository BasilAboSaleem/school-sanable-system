const{
    Income,
    Supplier
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
exports.listIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ schoolId: req.user.schoolId })
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
    const income = await Income.findById(req.params.id).populate("supplierId");

    if (!income) {
      req.flash("error", "Income not found");
      return res.redirect("/school-admin/incomes");
    }

    res.render("dashboard/school-admin/income/view-income", { income });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading income details");
    res.redirect("/school-admin/incomes");
  }
};

// Delete Income
exports.deleteIncome = async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    req.flash("success", "Income deleted successfully");
    res.redirect("/school-admin/incomes");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete income");
    res.redirect("/school-admin/incomes");
  }
};
