const{
    Income,
    Supplier,
    School,
    Expense
} = require("./utils");


// عرض جميع الواردات
exports.listIncomes = async (req, res) => {
  try {
    const incomes = await Income.find()
      .populate("supplierId")
      .sort({ createdAt: -1 });

    res.render("dashboard/super-admin/income/incomes", { incomes });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحميل الواردات");
    res.redirect("/super-admin");
  }
};

exports.renderAddIncome = async (req, res) => {
  try {
    // جلب جميع الموردين الذين يمكن للسوبر اختيارهم
    const suppliers = await Supplier.find({ 
      $or: [
        { isSuperAdminSupplier: true }, // مورد خاص بالسوبر
        { schoolId: null } // مورد عام بدون مدرسة
      ]
    }).sort({ name: 1 });

    res.render("dashboard/super-admin/income/add-income", { suppliers });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحميل الموردين");
    res.redirect("/super-admin/incomes");
  }
};
// إنشاء وارد جديد (مع إنشاء مورد إذا كان جديد)
exports.createIncome = async (req, res) => {
  try {
    const { supplierId, supplierName, email, phone, address, notes, amount, description } = req.body;
    const userId = req.user._id; // السوبر أدمن الحالي

    let supplier;

    if (supplierId && supplierId !== 'new') {
      // مورد موجود
      supplier = await Supplier.findById(supplierId);
      if (!supplier) return res.json({ errors: { general: "المورد غير موجود" } });
    } else {
      // مورد جديد
      if (!supplierName || !amount) return res.json({ errors: { general: "اسم المورد والمبلغ مطلوبان" } });
      supplier = new Supplier({
        name: supplierName,
        email,
        phone,
        address,
        notes,
        isSuperAdminSupplier: true,
        schoolId: null
      });
      await supplier.save();
    }

    // إنشاء الوارد
    const income = new Income({
      supplierId: supplier._id,
      amount,
      description,
      createdBy: userId
    });
    await income.save();

    res.json({ success: "تم إضافة الوارد بنجاح", redirect: "/super-admin/incomes" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "حدث خطأ أثناء إضافة الوارد" } });
  }
};

// صفحة عرض تفاصيل وارد + توزيع على المدارس
// عرض تفاصيل الوارد + صفحة التوزيع
// عرض تفاصيل الوارد + صفحة التوزيع
exports.viewIncomeDetails = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id).populate("supplierId");
    if (!income) {
      req.flash("error", "الوارد غير موجود");
      return res.redirect("/super-admin/incomes");
    }

    // جلب التوزيعات السابقة باستخدام incomeId (الحل الجذري)
    const distributedExpenses = await Expense.find({ incomeId: income._id })
      .populate("schoolId")
      .sort({ createdAt: -1 });

    const schools = await School.find().sort({ name: 1 });

    res.render("dashboard/super-admin/income/view-income", {
      income,
      distributedExpenses,
      schools,
    });
  } catch (err) {
    console.error("[viewIncomeDetails Error]:", err);
    req.flash("error", "حدث خطأ أثناء تحميل تفاصيل الوارد");
    res.redirect("/super-admin/incomes");
  }
};

// توزيع الوارد على المدارس
exports.distributeIncome = async (req, res) => {
  try {
    // populate عشان نأخذ اسم المورد
    const income = await Income.findById(req.params.id).populate("supplierId");
    if (!income) {
      return res.status(404).json({ errors: { general: "الوارد غير موجود" } });
    }

    const { allocations, distributionDescription } = req.body;

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ errors: { general: "لا توجد توزيعات لإرسالها" } });
    }

    // جلب التوزيعات السابقة عبر incomeId (مش description)
    const distributedExpenses = await Expense.find({ incomeId: income._id });
    const totalDistributed = distributedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = income.amount - totalDistributed;

    const totalToDistribute = allocations.reduce(
      (sum, alloc) => sum + Number(alloc.amount || 0),
      0
    );

    if (totalToDistribute > remaining) {
      return res.status(400).json({
        errors: {
          general: `المجموع (${totalToDistribute.toLocaleString()}) أكبر من المبلغ المتبقي (${remaining.toLocaleString()})`,
        },
      });
    }

    // إنشاء التوزيعات الجديدة
    for (const alloc of allocations) {
      const amt = Number(alloc.amount || 0);
      if (amt <= 0) continue;

      const newExpense = new Expense({
        schoolId: alloc.schoolId,
        amount: amt,
        // فئة واضحة بالعربي
        category: income.supplierId
          ? `موزع من المورد: ${income.supplierId.name}`
          : "توزيع وارد عام",
        // وصف حر + افتراضي جميل
        description:
          distributionDescription?.trim() ||
          `توزيع تلقائي من وارد رقم ${income._id} - ${new Date().toLocaleDateString('ar-EG')}`,
        source: "institution", // صحيح لأنه من السوبر أدمن
        incomeId: income._id, // ← الربط القوي والجذري
      });

      await newExpense.save();
    }

    res.json({ success: "تم توزيع المبلغ بنجاح" });
  } catch (err) {
    console.error("[distributeIncome Error]:", err);
    res.status(500).json({ errors: { general: "حدث خطأ أثناء التوزيع" } });
  }
};
// صفحة تعديل وارد
exports.renderEditIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id).populate("supplierId");
    if (!income) {
      req.flash("error", "الوارد غير موجود");
      return res.redirect("/super-admin/incomes");
    }

    // تحقق هل عليه توزيعات
    const hasDistributions = await Expense.exists({
      description: `Allocated from income ${income._id}`
    });

    if (hasDistributions) {
      req.flash("error", "لا يمكن تعديل هذا الوارد لأنه تم توزيع جزء منه");
      return res.redirect(`/super-admin/incomes/${income._id}/view`);
    }

    const suppliers = await Supplier.find();

    res.render("dashboard/super-admin/income/edit-income", {
      income,
      suppliers
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ");
    res.redirect("/super-admin/incomes");
  }
};

// تحديث وارد
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.json({ errors: { general: "الوارد غير موجود" } });
    }

    // حماية إضافية (حتى لو لعب بالـ URL)
    const hasDistributions = await Expense.exists({
      description: `Allocated from income ${income._id}`
    });

    if (hasDistributions) {
      return res.json({
        errors: { general: "لا يمكن تعديل الوارد بعد بدء التوزيع" }
      });
    }

    income.amount = req.body.amount;
    income.description = req.body.description;
    income.supplierId = req.body.supplierId;

    await income.save();

    res.json({
      success: "تم تعديل الوارد بنجاح",
      redirect: `/super-admin/incomes/${income._id}/view`
    });

  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "حدث خطأ أثناء التعديل" } });
  }
};

