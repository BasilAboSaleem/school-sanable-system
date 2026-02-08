const{
    Class,
    Section,
    Student,
    ParentProfile,
    Attendance,
    Grade,
    Exam,
    TeacherSubject,
    User,
    
}= require("./utils");

exports.renderCreateClassForm = (req, res) => {
  res.render("dashboard/school-admin/class/add-class", { title: "إضافة فصل جديد" });
  
}

exports.createClass = async (req, res) => {
  const { name, status, checkField } = req.body;
  const schoolId = req.user.schoolId;

  try {
    // التحقق من الاسم الفريد للـ AJAX فقط
    if(checkField === 'name' && name){
      const existing = await Class.findOne({ name: name.trim(), schoolId });
      if(existing){
        return res.json({ error: "اسم الفصل مستخدم مسبقاً" });
      } else {
        return res.json({ error: null });
      }
    }

    // تحقق من الإدخال النهائي
    if(!name || !name.trim()){
      return res.json({ errors: { name: "اسم الفصل مطلوب" } });
    }

    // **إعادة التحقق من الاسم النهائي قبل الإنشاء**
    const existing = await Class.findOne({ name: name.trim(), schoolId });
    if(existing){
      return res.json({ errors: { name: "اسم الفصل مستخدم مسبقاً" } });
    }

    // إنشاء الفصل الجديد
    const newClass = new Class({
      name: name.trim(),
      schoolId,
      status: status || 'active'
    });

    await newClass.save();
     req.flash("success", "تم إضافة الفصل بنجاح");
    return res.json({
  redirect: `/school-admin/sections/create`
});

   

  } catch(err){
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة الفصل" } });
  }
};

exports.listClasses = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId }).populate('sections').sort({ createdAt: -1 });
    res.render("dashboard/school-admin/class/all-classes", { title: "جميع الفصول", classes });
  } catch(err){
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الفصول");
    res.redirect("/school-admin");
  }
};

exports.renderEditClassForm = async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });

    if (!cls) {
      req.flash("error", "الفصل غير موجود");
      return res.redirect("/school-admin/classes");
    }

    res.render("dashboard/school-admin/class/edit-class", {
      title: "تعديل الفصل",
      cls
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الفصل");
    res.redirect("/school-admin/classes");
  }
};

exports.updateClass = async (req, res) => {
  const { name, status, checkField } = req.body;
  const classId = req.params.id;

  try {
    // AJAX للتحقق من الاسم الفريد
    if(checkField === 'name' && name){
      const existing = await Class.findOne({ name: name.trim(), schoolId: req.user.schoolId, _id: { $ne: classId } });
      if(existing){
        return res.json({ error: "اسم الفصل مستخدم مسبقاً" });
      } else {
        return res.json({ error: null });
      }
    }

    // تحقق الإدخال النهائي
    if(!name || !name.trim()){
      return res.json({ errors: { name: "اسم الفصل مطلوب" } });
    }

    // تحقق من عدم التكرار
    const existing = await Class.findOne({ name: name.trim(), schoolId: req.user.schoolId, _id: { $ne: classId } });
    if(existing){
      return res.json({ errors: { name: "اسم الفصل مستخدم مسبقاً" } });
    }

    // تحديث الفصل
    await Class.updateOne(
      { _id: classId, schoolId: req.user.schoolId },
      { $set: { name: name.trim(), status: status || 'active' } }
    );

    req.flash("success", "تم تعديل الفصل بنجاح");
    return res.json({
  redirect: "/school-admin/classes"
});

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء تعديل الفصل" } });
  }
};


exports.deleteClassCascade = async (req, res) => {
  const classId = req.params.id;

  try {
      if (!classId) {
    return res.status(400).json({
      success: false,
      message: "معرف الفصل غير صالح"
    });
  }
    const sections = await Section.find({ classId });
    const sectionIds = sections.map(s => s._id);

    const students = await Student.find({ classId });
    const studentIds = students.map(s => s._id);

    await Attendance.deleteMany({ classId });
    await Grade.deleteMany({ classId });
    await Exam.deleteMany({ classId });
    await TeacherSubject.deleteMany({ classId });

    await ParentProfile.updateMany(
      { students: { $in: studentIds } },
      { $pull: { students: { $in: studentIds } } }
    );

    await User.updateMany(
      { classes: classId },
      { $pull: { classes: classId } }
    );

    await Student.deleteMany({ _id: { $in: studentIds } });
    await Section.deleteMany({ classId });
    await Class.findByIdAndDelete(classId);

   req.flash("success", "تم حذف الفصل وجميع البيانات المرتبطة به بنجاح");
    return res.json({
      redirect: "/school-admin/classes"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "خطأ أثناء حذف الفصل"
    });
  }
};


 