const{
    Subject,
    User,
} = require("./utils");



exports.renderCreateSubjectForm = (req, res) => {
  res.render("dashboard/school-admin/subject/add-subject", { title: "إضافة مادة جديدة" });
};

exports.createSubject = async (req, res) => {
  const { name, code, status, checkField } = req.body;
  const schoolId = req.user.schoolId;

  try {
    // تحقق سريع للـ AJAX من الاسم الفريد
    if(checkField === 'name' && name){
      const existing = await Subject.findOne({ name: name.trim(), schoolId });
      if(existing){
        return res.json({ error: "اسم المادة مستخدم مسبقاً" });
      } else {
        return res.json({ error: null });
      }
    }

    // تحقق الإدخال النهائي
    if(!name || !name.trim()){
      return res.json({ errors: { name: "اسم المادة مطلوب" } });
    }

    // إعادة التحقق النهائي
    const existing = await Subject.findOne({ name: name.trim(), schoolId });
    if(existing){
      return res.json({ errors: { name: "اسم المادة مستخدم مسبقاً" } });
    }

    // إنشاء المادة الجديدة
    const newSubject = new Subject({
      name: name.trim(),
      code: code?.trim() || "",
      schoolId,
      status: status || "active"
    });

    await newSubject.save();

    return res.json({ success: "تم إضافة المادة بنجاح" });

  } catch(err){
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة المادة" } });
  }
};

exports.listSubjects = async (req, res) => {
  try {
    // جلب كل المواد التابعة للمدرسة
    const subjects = await Subject.find({ schoolId: req.user.schoolId }).sort({ createdAt: -1 });

    // لكل مادة نحسب عدد المعلمين المرتبطين بها
    for (let subj of subjects) {
      const teachersCount = await User.countDocuments({
        role: 'teacher',
        schoolId: req.user.schoolId,
        subjects: subj._id
      });
      subj.teachersCount = teachersCount;
    }

    res.render("dashboard/school-admin/subject/all-subject", {
      title: "جميع المواد",
      subjects
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب المواد");
    res.redirect("/school-admin");
  }
};

exports.renderEditSubjectForm = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      req.flash("error", "المادة غير موجودة");
      return res.redirect("/school-admin/subjects");
    }

    res.render("dashboard/school-admin/subject/edit-subject", {
      title: "تعديل المادة",
      subject
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب المادة");
    res.redirect("/school-admin/subjects");
  }
};

exports.updateSubject = async (req, res) => {
  const { name, status } = req.body;

  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.json({ errors: { general: "المادة غير موجودة" } });
    }

    if (!name || !name.trim()) {
      return res.json({ errors: { name: "اسم المادة مطلوب" } });
    }

    // التحقق من الاسم الفريد داخل نفس المدرسة
    const existing = await Subject.findOne({
      _id: { $ne: req.params.id },
      name: name.trim(),
      schoolId: req.user.schoolId
    });

    if (existing) {
      return res.json({ errors: { name: "اسم المادة مستخدم مسبقاً" } });
    }

    subject.name = name.trim();
    subject.status = status || "active";

    await subject.save();

    req.flash("success", "تم تعديل المادة بنجاح");
    return res.json({ success: "تم تعديل المادة بنجاح", redirect: "/school-admin/subjects" });

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء تعديل المادة" } });
  }
};