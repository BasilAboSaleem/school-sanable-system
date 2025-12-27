const {
    Supplier,
    Income,
    Expense
} = require("./utils");


// صفحة عرض جميع الموردين
exports.renderSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().lean();
    res.render("dashboard/super-admin/suppliers/suppliers", { suppliers });
  } catch (err) {
    console.error(err);
    res.send("حدث خطأ أثناء جلب الموردين");
  }
};

// صفحة عرض واردات مورد محدد
exports.renderSupplierIncomes = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).lean();
    if (!supplier) return res.send("المورد غير موجود");

    const incomes = await Income.find({ supplierId: supplier._id }).sort({ createdAt: -1 }).lean();
    res.render("dashboard/super-admin/suppliers/supplier-incomes", { supplier, incomes });
  } catch (err) {
    console.error(err);
    res.send("حدث خطأ أثناء جلب الواردات");
  }
};