const { validationResult } = require("express-validator");
const User = require("../../models/User");

// ==================================================
// INDEX – عرض منسق المدرسة (واحد فقط)
// ==================================================
exports.index = async (req, res) => {
  try {
    const coordinator = await User.findOne({
      schoolId: req.user.schoolId,
      role: "school-coordinator"
    });

    res.render("dashboard/school-admin/coordinator/index", {
      pageTitle: "منسق المدرسة",
      coordinator,
      flash: req.flash()
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المنسق");
    res.redirect("/school-admin");
  }
};

// ==================================================
// Render CREATE
// ==================================================
exports.renderCreate = async (req, res) => {
  try {
    const exists = await User.findOne({
      schoolId: req.user.schoolId,
      role: "school-coordinator"
    });

    if (exists) {
      req.flash("error", "يوجد منسق لهذه المدرسة بالفعل");
      return res.redirect("/school-admin/coordinator");
    }

    res.render("dashboard/school-admin/coordinator/create", {
      pageTitle: "إضافة منسق المدرسة",
      old: {},
      csrfToken: req.csrfToken()
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ");
    res.redirect("/school-admin/coordinator");
  }
};

// ==================================================
// CREATE (POST) - JSON Response
// ==================================================
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json({ errors: errors.mapped() });

  try {
    const { name, email, phone, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.json({ errors: { email: { msg: "البريد الإلكتروني مستخدم بالفعل" } } });
    }

    await User.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      role: "school-coordinator",
      schoolId: req.user.schoolId,
      createdAt: new Date()
    });

    res.json({ success: "تم إضافة منسق المدرسة بنجاح", redirect: "/school-admin/coordinator" });

  } catch (err) {
    console.error(err);
    res.json({ flashError: "حدث خطأ أثناء الإضافة" });
  }
};

// ==================================================
// Render EDIT
// ==================================================
exports.renderEdit = async (req, res) => {
  try {
    const coordinator = await User.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      role: "school-coordinator"
    });

    if (!coordinator) {
      req.flash("error", "المنسق غير موجود");
      return res.redirect("/school-admin/coordinator");
    }

    res.render("dashboard/school-admin/coordinator/edit", {
      pageTitle: "تعديل منسق المدرسة",
      coordinator,
      csrfToken: req.csrfToken()
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ");
    res.redirect("/school-admin/coordinator");
  }
};

// ==================================================
// UPDATE (POST) - JSON Response
// ==================================================
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json({ errors: errors.mapped() });

  try {
    const { name, email, phone, password } = req.body;

    const coordinator = await User.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      role: "school-coordinator"
    });

    if (!coordinator) return res.json({ flashError: "المنسق غير موجود" });

    // تحقق من البريد الإلكتروني فقط إذا تم تغييره
    if (email && email.trim() !== coordinator.email) {
      const emailExists = await User.findOne({
        email: email.trim(),
        _id: { $ne: coordinator._id }
      });
      if (emailExists) {
        return res.json({ errors: { email: { msg: "البريد الإلكتروني مستخدم بالفعل" } } });
      }
      coordinator.email = email.trim();
    }

    // تحديث باقي الحقول فقط إذا تم إدخال قيمة جديدة
    if (name && name.trim() !== coordinator.name) coordinator.name = name.trim();
    if (phone && phone.trim() !== coordinator.phone) coordinator.phone = phone.trim();
    if (password && password.trim() !== "") coordinator.password = password.trim(); // password اختياري

    await coordinator.save();

    // إعادة نفس نمط Create مع redirect
    res.json({ success: "تم تحديث بيانات المنسق بنجاح", redirect: "/school-admin/coordinator" });

  } catch (err) {
    console.error(err);
     console.error("UPDATE COORDINATOR ERROR =>", err);
    res.json({ flashError: "حدث خطأ أثناء التعديل" });
  }
};



// ==================================================
// DELETE
// ==================================================
exports.delete = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      role: "school-coordinator"
    });

    if (!deleted) return res.json({ flashError: "المنسق غير موجود" });

    res.json({ success: "تم حذف منسق المدرسة", redirect: "/school-admin/coordinator" });

  } catch (err) {
    console.error(err);
    res.json({ flashError: "حدث خطأ أثناء الحذف" });
  }
};
