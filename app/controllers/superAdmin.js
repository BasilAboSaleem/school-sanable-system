const School = require("../models/School");
const User = require("../models/User");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Supplier = require("../models/Supplier");

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

exports.getAddSchool = (req, res) => {
  res.render("dashboard/super-admin/add-school", {
    title: "إضافة مدرسة جديدة"
  });
};

exports.postAddSchool = async (req, res) => {
  try {
    const { name, address, phone, email, code, status, adminName, adminEmail, adminPassword, checkField } = req.body;

    // verify individual field if requested AJAX validation
    if (checkField) {
      let exists = false;
      let errorMessage = "";

      if (checkField === "code") {
        exists = await School.findOne({ code });
        errorMessage = exists ? "كود المدرسة مستخدم مسبقًا" : "";
      }

      if (checkField === "adminEmail") {
        exists = await User.findOne({ email: adminEmail });
        errorMessage = exists ? "البريد الإلكتروني مستخدم مسبقًا" : "";
      }

      if (checkField === "adminPassword") {
        errorMessage = strongPasswordRegex.test(adminPassword) ? "" : 
          "يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، رقم، ورمز";
      }

      return res.json({ error: errorMessage });
    }

    // إذا كان إرسال الفورم النهائي
    let errors = {};

    if (!name) errors.name = "اسم المدرسة مطلوب";
    if (!code) errors.code = "كود المدرسة مطلوب";
    if (!adminName) errors.adminName = "اسم المدير مطلوب";
    if (!adminEmail) errors.adminEmail = "ايميل المدير مطلوب";
    if (!adminPassword) errors.adminPassword = "كلمة المرور مطلوبة";

    if (adminPassword && !strongPasswordRegex.test(adminPassword)) {
      errors.adminPassword = "كلمة المرور غير قوية";
    }

    if (code && await School.findOne({ code })) {
      errors.code = "كود المدرسة مستخدم مسبقًا";
    }

    if (adminEmail && await User.findOne({ email: adminEmail })) {
      errors.adminEmail = "البريد الإلكتروني مستخدم مسبقًا";
    }

    if (Object.keys(errors).length > 0) {
      return res.json({ errors });
    }

    // create school
    const school = await School.create({ name, address, phone, email, code, status });

    // create school admin user
    await User.create({ name: adminName, email: adminEmail, password: adminPassword, role: "school-admin", schoolId: school._id, phone });

     req.flash("success", "تم إضافة المدرسة ومديرها بنجاح");
    return res.redirect("/super-admin/schools");

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ غير متوقع" } });
  }
};


// عرض جميع المدارس
exports.listSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.render("dashboard/super-admin/list-schools", { schools });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب المدارس");
    res.redirect("/");
  }
};

// عرض تفاصيل مدرسة واحدة
exports.viewSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      req.flash("error", "المدرسة غير موجودة");
      return res.redirect("/super-admin/schools");
    }
    res.render("dashboard/super-admin/view-school", { school });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المدرسة");
    res.redirect("/super-admin/schools");
  }
};

// صفحة تعديل مدرسة
exports.editSchoolForm = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      req.flash("error", "المدرسة غير موجودة");
      return res.redirect("/super-admin/schools");
    }
    res.render("dashboard/super-admin/edit-school", { school });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المدرسة");
    res.redirect("/super-admin/schools");
  }
};

// تحديث مدرسة
exports.updateSchool = async (req, res) => {
  try {
    const { name, code, address, phone, email } = req.body;

    // تحقق من تكرار الاسم أو الكود
    const duplicate = await School.findOne({
      $or: [{ name }, { code }],
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      return res.json({ errors: { general: "الاسم أو الكود موجود بالفعل" } });
    }

    const school = await School.findById(req.params.id);
    if (!school) {
      return res.json({ errors: { general: "المدرسة غير موجودة" } });
    }

    school.name = name;
    school.code = code;
    school.address = address;
    school.phone = phone;
    school.email = email;

    await school.save();

    res.json({ success: "تم تحديث بيانات المدرسة", redirect: "/super-admin/schools" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "حدث خطأ أثناء تحديث بيانات المدرسة" } });
  }
};

// List all school-admin users
exports.listSchoolAdmins = async (req, res) => {
  try {
    const schoolAdmins = await User.find({ role: 'school-admin' }).populate('schoolId');
    res.render('dashboard/super-admin/list-school-admins', { schoolAdmins });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المدراء');
    res.redirect('/super-admin');
  }
};

// View single school-admin
exports.viewSchoolAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).populate('schoolId');
    if (!admin) {
      req.flash('error', 'المدير غير موجود');
      return res.redirect('/super-admin/school-admins');
    }
    res.render('dashboard/super-admin/view-school-admin', { admin });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المدير');
    res.redirect('/super-admin/school-admins');
  }
};

// Show edit form
exports.editSchoolAdminForm = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    const schools = await School.find({});
    if (!admin) {
      req.flash('error', 'المدير غير موجود');
      return res.redirect('/super-admin/school-admins');
    }
    res.render('dashboard/super-admin/edit-school-admin', { admin, schools });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المدير');
    res.redirect('/super-admin/school-admins');
  }
};

// Update school-admin
exports.updateSchoolAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ errors: { general: 'المدير غير موجود' } });
    }

    // Check for unique email
    if (req.body.email && req.body.email !== admin.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.json({ errors: { email: 'البريد الإلكتروني مستخدم بالفعل' } });
      }
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;
    admin.schoolId = req.body.schoolId || admin.schoolId;

    await admin.save();
    res.json({ success: 'تم تحديث بيانات المدير بنجاح', redirect: '/super-admin/school-admins' });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: 'حدث خطأ أثناء تحديث بيانات المدير' } });
  }
};

// عرض جميع الواردات
exports.listIncomes = async (req, res) => {
  const incomes = await Income.find().populate("supplierId").sort({ createdAt: -1 });
  res.render("dashboard/super-admin/incomes", { incomes });
};

// صفحة إضافة وارد جديد
exports.renderAddIncome = async (req, res) => {
  res.render("dashboard/super-admin/add-income");
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
  res.render("dashboard/super-admin/view-income", { income, schools, distributedExpenses });
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
  res.render("dashboard/super-admin/edit-income", { income, suppliers });
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

// عرض  صادرات المؤسسة
exports.listExpenses = async (req, res) => {
  const expenses = await Expense.find({ source: "institution" })
    .populate("schoolId")
    .sort({ createdAt: -1 });

  res.render("dashboard/super-admin/expenses", { expenses });
};

// صادرات المدارس (عرض فقط)
exports.listSchoolExpenses = async (req, res) => {
  const expenses = await Expense.find({ source: "school" })
    .populate("schoolId")
    .sort({ createdAt: -1 });

  res.render("dashboard/super-admin/school-expenses", { expenses });
};
// صفحة إضافة صادر جديد
exports.renderAddExpense = async (req, res) => {
  const schools = await School.find();
  res.render("dashboard/super-admin/add-expense", { schools });
};

// إنشاء صادر جديد
exports.createExpense = async (req, res) => {
  try {
    const { schoolId, amount, category, description } = req.body;

    const expense = new Expense({
      schoolId,
      amount,
      category,
      description,
      source: "institution"
    });
    await expense.save();

    res.json({ success: "Expense added successfully", redirect: "/super-admin/expenses" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error adding expense" } });
  }
};

// صفحة عرض تفاصيل صادر
exports.viewExpenseDetails = async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate("schoolId");
  res.render("dashboard/super-admin/view-expense", { expense });
};

// صفحة تعديل صادر
exports.renderEditExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  const schools = await School.find();
  res.render("dashboard/super-admin/edit-expense", { expense, schools });
};

// تحديث صادر
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    expense.schoolId = req.body.schoolId;
    expense.amount = req.body.amount;
    expense.category = req.body.category;
    expense.description = req.body.description;
    await expense.save();

    res.json({ success: "Expense updated successfully", redirect: "/super-admin/expenses" });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "Error updating expense" } });
  }
};

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
