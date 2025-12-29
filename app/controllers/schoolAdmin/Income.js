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

exports.addIncome = async (req, res) => {
  try {
    const { supplierId, incomeType, amount, description } = req.body;

    // التحقق من الحقول الأساسية
    if (!supplierId) {
      return res.status(400).json({ errors: { general: "Supplier is required" } });
    }

    if (!incomeType || !['financial','physical'].includes(incomeType)) {
      return res.status(400).json({ errors: { general: "Please specify a valid income type (financial or physical)" } });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ errors: { general: "Description is required" } });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ 
        errors: { general: incomeType === 'financial' ? "Amount is required for financial income" : "Quantity is required for physical income" } 
      });
    }

    // إنشاء الوارد
    const income = new Income({
      supplierId,
      amount, // سواء مالي أو عيني، نحفظه في الحقل amount
      description,
      incomeType,
      schoolId: req.user.schoolId,
      createdBy: req.user._id
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

    // منع التعديل إذا حصل أي توزيع
    const hasDistributions = await Expense.exists({ incomeId: income._id });
    if (hasDistributions) {
      return res.status(400).json({
        errors: { general: "لا يمكن تعديل الوارد بعد بدء أي توزيع" }
      });
    }

    const { supplierId, incomeType, amount, description } = req.body;

    // التحقق من الحقول الأساسية
    if (!supplierId) {
      return res.status(400).json({ errors: { general: "Supplier is required" } });
    }

    if (!incomeType || !['financial','physical'].includes(incomeType)) {
      return res.status(400).json({ errors: { general: "Please specify a valid income type (financial or physical)" } });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ 
        errors: { general: incomeType === 'financial' ? "Amount is required for financial income" : "Quantity is required for physical income" } 
      });
    }

    // حفظ البيانات
    income.supplierId = supplierId;
    income.incomeType = incomeType;
    income.amount = amount;
    income.description = description;

    await income.save();
    return res.json({ success: "تم تعديل الوارد بنجاح", redirect: "/school-admin/incomes" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: { general: "حدث خطأ أثناء تعديل الوارد" } });
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




