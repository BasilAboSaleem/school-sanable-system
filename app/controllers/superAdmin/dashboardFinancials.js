const{
    Supplier,
    Income,
    Expense
} = require("./utils");


// لوحة شاملة للسوبر أدمن
exports.dashboardFinancials = async (req, res) => {
try {
    // جلب الموردين
    const suppliers = await Supplier.find().lean();

    // جلب الواردات مع supplier و school
    const incomes = await Income.find()
      .populate("supplierId")
      .populate("schoolId")
      .sort({ createdAt: -1 })
      .lean();

    // جلب الصادرات مع school وربط incomeId (لإظهار المورد/الوارد)
    const expenses = await Expense.find()
      .populate("schoolId")
      .populate({
        path: "incomeId",
        populate: { path: "supplierId" }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.render("dashboard/super-admin/dashboard-financials", {
      suppliers,
      incomes,
      expenses
    });
  } catch (err) {
    console.error("[financialReport Error]:", err);
    req.flash("error", "حدث خطأ أثناء تحميل التقرير المالي");
    res.redirect("/super-admin/dashboard");
  }
};
