const{
    Income,
    Supplier,
    School,
    Expense
} = require("./utils");


// عرض جميع الواردات
exports.listIncomes = async (req, res) => {
  const incomes = await Income.find().populate("supplierId").sort({ createdAt: -1 });
  res.render("dashboard/super-admin/income/incomes", { incomes });
};

// صفحة إضافة وارد جديد
exports.renderAddIncome = async (req, res) => {
  res.render("dashboard/super-admin/income/add-income");
};

// إنشاء وارد جديد (مع إنشاء مورد إذا كان جديد)
exports.createIncome = async (req, res) => {
  try {
    let { supplierName, email, phone, address, notes, amount, description } = req.body;

    // تحقق إذا كان المورد موجود
    let supplier = await Supplier.findOne({ name: supplierName });
    if (!supplier) {
      supplier = new Supplier({ name: supplierName, email, phone, address, notes });
      await supplier.save();
    }

    const income = new Income({
      supplierId: supplier._id,
      amount,
      description,
    });
    await income.save();

    res.json({ success: "Income added successfully", redirect: "/super-admin/incomes" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error adding income" } });
  }
};

// صفحة عرض تفاصيل وارد + توزيع على المدارس
exports.viewIncomeDetails = async (req, res) => {
  const income = await Income.findById(req.params.id).populate("supplierId");
  const schools = await School.find().sort({ name: 1 });
  const distributedExpenses = await Expense.find({ description: `Allocated from income ${income._id}` }).populate("schoolId");
  res.render("dashboard/super-admin/income/view-income", { income, schools, distributedExpenses });
};

// توزيع وارد على المدارس
exports.distributeIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    const { allocations } = req.body; // [{ schoolId, amount }, ...]
    
    let totalAllocated = 0;
    for (const alloc of allocations) {
      totalAllocated += Number(alloc.amount);
      const expense = new Expense({
        schoolId: alloc.schoolId,
        amount: alloc.amount,
        category: `Distributed from supplier ${income.supplierId}`,
        description: `Allocated from income ${income._id}`,
      });
      await expense.save();
    }

    if (totalAllocated > income.amount) {
      return res.json({ errors: { general: "Total allocated exceeds income amount" } });
    }

    res.json({ success: "Income distributed successfully", redirect: `/super-admin/incomes/${income._id}/view` });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error distributing income" } });
  }
};

// صفحة تعديل وارد
exports.renderEditIncome = async (req, res) => {
  const income = await Income.findById(req.params.id).populate("supplierId");
  const suppliers = await Supplier.find();
  res.render("dashboard/super-admin/income/edit-income", { income, suppliers });
};

// تحديث وارد
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    income.amount = req.body.amount;
    income.description = req.body.description;
    income.supplierId = req.body.supplierId;
    await income.save();
    res.json({ success: "Income updated successfully", redirect: "/super-admin/incomes" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error updating income" } });
  }
};
