const{
    User,
    Class,
    Subject
} = require("./utils");


// عرض صفحة إضافة مدرس
exports.renderCreateTeacherForm = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    const subjects = await Subject.find({ schoolId: req.user.schoolId });
    res.render("dashboard/school-admin/teacher/add-teacher", {
      title: "إضافة مدرس جديد",
      classes,
      subjects,
      flash: req.flash()
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب البيانات");
    res.redirect("/school-admin");
  }
};

// إنشاء مدرس جديد
exports.createTeacher = async (req, res) => {
  const { name, email, password, phone, classes, subjects, status, checkField } = req.body;

  try {
    // تحقق سريع للـ AJAX من البريد الإلكتروني
    if (checkField === "email" && email) {
      const existing = await User.findOne({ email: email.trim() });
      return res.json({ error: existing ? "البريد الإلكتروني مستخدم مسبقاً" : null });
    }

    // تحقق الإدخال النهائي
    const errors = {};
    if (!name || !name.trim()) errors.name = "الاسم مطلوب";
    if (!email || !email.trim()) errors.email = "البريد الإلكتروني مطلوب";
    if (!password || !password.trim()) errors.password = "كلمة المرور مطلوبة";

    const existing = await User.findOne({ email: email.trim() });
    if (existing) errors.email = "البريد الإلكتروني مستخدم مسبقاً";

    if (Object.keys(errors).length > 0) return res.json({ errors });

    // إنشاء المدرس الجديد
    const newTeacher = new User({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(), // الهاش يتم تلقائياً في pre('save')
      phone: phone ? phone.trim() : "",
      classes: classes || [],
      subjects: subjects || [],
      role: "teacher",
      schoolId: req.user.schoolId,
      status: status || "active"
    });

    await newTeacher.save();

    return res.json({
      success: "تم إضافة المدرس بنجاح",
      redirect: "/school-admin/teachers"
    });

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة المدرس" } });
  }
};

exports.listTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ 
      schoolId: req.user.schoolId,
      role: "teacher"
    })
    .populate("classes", "name")
    .populate("subjects", "name")
    .sort({ createdAt: -1 });

    res.render("dashboard/school-admin/teacher/all-teachers", {
      title: "جميع المدرسين",
      teachers,
      flash: req.flash()
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب المدرسين");
    res.redirect("/school-admin");
  }
};



// عرض صفحة تعديل مدرس
exports.renderEditTeacherForm = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id)
      .populate("classes")
      .populate("subjects");

    const classes = await Class.find({ schoolId: req.user.schoolId });
    const subjects = await Subject.find({ schoolId: req.user.schoolId });

    res.render("dashboard/school-admin/teacher/edit-teacher", {
      title: "تعديل مدرس",
      teacher,
      classes,
      subjects
    });
  } catch(err){
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات المدرس");
    res.redirect("/school-admin/teachers");
  }
};

// POST تحديث بيانات المدرس
exports.updateTeacher = async (req, res) => {
  const { name, email, password, phone, classes, subjects, status, checkField } = req.body;

  try {
    if(checkField === 'email' && email){
      const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
      if(existing) return res.json({ error: "البريد الإلكتروني مستخدم مسبقاً" });
      return res.json({ error: null });
    }

    const teacher = await User.findById(req.params.id);
    if(!teacher) return res.json({ errors: { general: "لم يتم العثور على المدرس" } });

    teacher.name = name.trim();
    teacher.email = email.trim();
    if(password && password.trim()) teacher.password = password;
    teacher.phone = phone;
    teacher.classes = classes || [];
    teacher.subjects = subjects || [];
    teacher.status = status;

    await teacher.save();

    return res.json({ success: "تم تحديث بيانات المدرس بنجاح" });
  } catch(err){
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء تحديث بيانات المدرس" } });
  }
};