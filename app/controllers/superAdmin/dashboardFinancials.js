const{
    Supplier,
    Income,
    Expense
} = require("./utils");


// لوحة شاملة للسوبر أدمن
exports.dashboardFinancials = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    const incomes = await Income.find().populate("supplierId schoolId").sort({ createdAt: -1 });
    const expenses = await Expense.find().populate("schoolId").sort({ createdAt: -1 });

    res.render("dashboard/super-admin/dashboard-financials", {
      suppliers,
      incomes,
      expenses
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحميل البيانات");
    res.redirect("/super-admin");
  }
};

