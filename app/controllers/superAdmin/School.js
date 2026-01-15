const {
    School,
    User,
    strongPasswordRegex
} = require("./utils");

exports.getAddSchool = (req, res) => {
  res.render("dashboard/super-admin/school/add-school", {
    title: "إضافة مدرسة جديدة"
  });
};

exports.postAddSchool = async (req, res) => {
  try {
    const { name, address, phone, email, code, status, adminName, adminEmail, adminPassword, checkField } = req.body;
    const { validationResult } = require('express-validator');

    // AJAX Field Check (Keep manual or move to separate route? Keeping here for compatibility)
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

    // Full Submission Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // Convert array to object for frontend compatibility { field: msg }
       const errorObj = {};
       errors.array().forEach(err => errorObj[err.path] = err.msg); // err.param is now err.path in v7
       return res.json({ errors: errorObj });
    }

    // create school
    const school = await School.create({ name, address, phone, email, code, status });

    // create school admin user
    await User.create({ name: adminName, email: adminEmail, password: adminPassword, role: "school-admin", schoolId: school._id, phone: "-" });

    return res.json({ success: "تم إضافة المدرسة ومديرها بنجاح" });

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ غير متوقع" } });
  }
};


exports.listSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.render("dashboard/super-admin/school/list-schools", { schools });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب المدارس");
    res.redirect("/");
  }
};


exports.viewSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      req.flash("error", "المدرسة غير موجودة");
      return res.redirect("/super-admin/schools");
    }

    const schoolAdmin = await User.findOne({
      schoolId: school._id,
      role: "school-admin"
    }).select("name email phone");

    const totalTeachers = await User.countDocuments({
      schoolId: school._id,
      role: "teacher"
    });

    const totalStudents = await User.countDocuments({
      schoolId: school._id,
      role: "student"
    });

    res.render("dashboard/super-admin/school/view-school", {
      school,
      schoolAdmin,
      totalTeachers,
      totalStudents
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المدرسة");
    res.redirect("/super-admin/schools");
  }
};



exports.editSchoolForm = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      req.flash("error", "المدرسة غير موجودة");
      return res.redirect("/super-admin/schools");
    }
    res.render("dashboard/super-admin/school/edit-school", { school });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المدرسة");
    res.redirect("/super-admin/schools");
  }
};


exports.updateSchool = async (req, res) => {
  try {
    const { name, code, address, phone, email, status } = req.body;

    
    const duplicate = await School.findOne({
      $or: [{ name }, { code }],
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.json({
        errors: { general: "اسم المدرسة أو الكود مستخدم مسبقًا" }
      });
    }

    const school = await School.findById(req.params.id);
    if (!school) {
      return res.json({
        errors: { general: "المدرسة غير موجودة" }
      });
    }

    school.name = name;
    school.code = code;
    school.address = address;
    school.phone = phone;
    school.email = email;
    school.status = status; 

    await school.save();

    res.json({
      success: "تم تحديث بيانات المدرسة بنجاح",
      redirect: "/super-admin/schools"
    });

  } catch (err) {
    console.error(err);
    res.json({
      errors: { general: "حدث خطأ أثناء تحديث بيانات المدرسة" }
    });
  }
}; 
