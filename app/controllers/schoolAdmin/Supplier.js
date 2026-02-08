const{
    Supplier,
    Income,
} = require("./utils");


exports.renderAddSupplierForm = (req, res) => {
  try {
    res.render("dashboard/school-admin/supplier/add-supplier");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحميل الصفحة");
    res.redirect("/school-admin/suppliers");
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.json({ errors: { general: errors.array()[0].msg } });
    }

    const { name, email, phone, address, notes } = req.body;

    // تحقق من التكرار بنفس المدرسة
    const existing = await Supplier.findOne({ name: name.trim(), schoolId: req.user.schoolId });
    if (existing) {
      return res.json({ errors: { name: "هذا المورد موجود مسبقًا" } });
    }

    const supplier = new Supplier({
      name: name.trim(),
      email,
      phone,
      address,
      notes,
      schoolId: req.user.schoolId
    });

    await supplier.save();

    return res.json({ redirect: "/school-admin/suppliers" });

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء الإضافة" } });
  }
};


// عرض جميع الموردين مع البحث
exports.listSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ schoolId: req.user.schoolId }).sort({ createdAt: -1 }).lean();
    res.render("dashboard/school-admin/supplier/suppliers", { suppliers });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الموردين");
    res.redirect("/dashboard");
  }
};

// صفحة تعديل مورد
exports.renderEditSupplierForm = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).lean();
    if (!supplier) {
      req.flash("error", "المورد غير موجود");
      return res.redirect("/school-admin/suppliers");
    }
    res.render("dashboard/school-admin/supplier/edit-supplier", { supplier });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المورد");
    res.redirect("/school-admin/suppliers");
  }
};

// تحديث مورد
exports.updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { name, email, phone, address, notes } = req.body;

    // التأكد أن المورد موجود
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ errors: { general: "المورد غير موجود" } });
    }

    // التحقق من الاسم الفريد (تجاهل المورد الحالي)
    const existing = await Supplier.findOne({ name: name.trim(), _id: { $ne: supplierId } });
    if (existing) {
      return res.status(400).json({ errors: { name: "اسم المورد مستخدم بالفعل" } });
    }

    // تحديث البيانات
    supplier.name = name.trim();
    supplier.email = email || '';
    supplier.phone = phone || '';
    supplier.address = address || '';
    supplier.notes = notes || '';

    await supplier.save();

    // إرسال JSON response للـ AJAX
    res.json({ redirect: "/school-admin/suppliers" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: { general: "حدث خطأ أثناء تحديث بيانات المورد" } });
  }
};


// حذف مورد
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    req.flash("success", "تم حذف المورد بنجاح");
    res.redirect("/school-admin/suppliers");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء حذف المورد");
    res.redirect("/school-admin/suppliers");
  }
};

// عرض تفاصيل المورد + الإيرادات
exports.viewSupplierDetails = async (req, res) => {
  try {
    const supplierId = req.params.id;

    // جلب بيانات المورد
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      req.flash("error", "المورد غير موجود");
      return res.redirect("/school-admin/suppliers");
    }

    // جلب الإيرادات الخاصة بالمورد
    const incomes = await Income.find({ supplierId })
      .sort({ createdAt: -1 });

    res.render("dashboard/school-admin/supplier/view-supplier", {
      title: `عرض المورد: ${supplier.name}`,
      supplier,
      incomes
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المورد");
    res.redirect("/school-admin/suppliers");
  }
};
