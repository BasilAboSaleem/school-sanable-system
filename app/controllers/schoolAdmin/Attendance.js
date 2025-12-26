const{
    User,
    
} = require("./utils");
    
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// render page
exports.renderCreateAttendanceUser = (req, res) => {
  res.render("dashboard/school-admin/attendance/add-attendance-user", {
    title: "إضافة موظف حضور"
  });
};

// AJAX check
exports.checkAttendanceUser = async (req, res) => {
  const { field, value } = req.body;

  if (!["name", "email"].includes(field)) return res.json({ exists: false });

  const query = {
    schoolId: req.user.schoolId,
    role: "attendance",
    [field]: value.trim()
  };

  const exists = await User.exists(query);
  res.json({ exists: !!exists });
};

// create
exports.createAttendanceUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!name || !email || !password) {
      return res.json({ errors: { general: "جميع الحقول مطلوبة" } });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.json({
        errors: {
          password: "كلمة المرور غير مطابقة للشروط"
        }
      });
    }

    const emailExists = await User.exists({ email });
    if (emailExists) {
      return res.json({
        errors: { email: "البريد الإلكتروني مستخدم مسبقاً" }
      });
    }

    const nameExists = await User.exists({
      name,
      schoolId: req.user.schoolId,
      role: "attendance"
    });

    if (nameExists) {
      return res.json({
        errors: { name: "الاسم مستخدم مسبقاً" }
      });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone,
      role: "attendance",
      schoolId: req.user.schoolId
    });

    await user.save();

    res.json({
      success: "تم إنشاء موظف الحضور بنجاح",
      redirect: "/school-admin/attendance-users"
    });

  } catch (err) {
    console.error(err);
    res.json({ errors: { general: "حدث خطأ أثناء الإنشاء" } });
  }
};

exports.listAttendanceUsers = async (req, res) => {
  try {
    const attendanceUsers = await User.find({ 
      schoolId: req.user.schoolId, 
      role: "attendance" 
    }).sort({ createdAt: -1 });

    res.render("dashboard/school-admin/attendance/attendance-users", {
      title: "جميع موظفي الحضور والغياب",
      attendanceUsers
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الموظفين");
    res.redirect("/school-admin");
  }
};

// حذف موظف
exports.deleteAttendanceUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ 
      _id: req.params.id, 
      schoolId: req.user.schoolId, 
      role: "attendance" 
    });

    if (!user) {
      req.flash("error", "الموظف غير موجود");
      return res.redirect("/school-admin/attendance-users");
    }

    req.flash("success", "تم حذف الموظف بنجاح");
    res.redirect("/school-admin/attendance-users");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء الحذف");
    res.redirect("/school-admin/attendance-users");
  }
};

// صفحة تعديل الموظف
exports.renderEditForm = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      schoolId: req.user.schoolId, 
      role: "attendance" 
    });

    if (!user) {
      req.flash("error", "الموظف غير موجود");
      return res.redirect("/school-admin/attendance-users");
    }

    res.render("dashboard/school-admin/attendance-users/edit-attendance-user", {
      title: "تعديل موظف الحضور",
      user
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الموظف");
    res.redirect("/school-admin/attendance-users");
  }
};

// تحديث الموظف
exports.updateAttendanceUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const user = await User.findOne({ 
      _id: req.params.id, 
      schoolId: req.user.schoolId, 
      role: "attendance" 
    });

    if (!user) {
      req.flash("error", "الموظف غير موجود");
      return res.redirect("/school-admin/attendance-users");
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (password) {
      // هنا نفس Regex اللي استخدمناها قبل
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        req.flash("error", "كلمة المرور غير مطابقة للشروط");
        return res.redirect(`/school-admin/attendance-users/${user._id}/edit`);
      }
      user.password = password;
    }

    await user.save();
    req.flash("success", "تم تحديث بيانات الموظف بنجاح");
    res.redirect("/school-admin/attendance-users");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحديث الموظف");
    res.redirect("/school-admin/attendance-users");
  }
};