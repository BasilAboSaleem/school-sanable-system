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