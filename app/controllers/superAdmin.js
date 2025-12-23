const School = require("../models/School");
const User = require("../models/User");

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
