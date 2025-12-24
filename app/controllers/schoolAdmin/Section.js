const{
    Section,
    Class
} = require("./utils");


exports.renderCreateSectionForm = async (req, res) => {
    const classes = await Class.find({ schoolId: req.user.schoolId });
  res.render("dashboard/school-admin/section/add-section", { title: "إضافة شعبة جديدة", classes });
};

exports.createSection = async (req, res) => {
  const { name, classId, checkField, status } = req.body;

  try {
    // تحقق سريع للـ AJAX
    if(checkField === 'name' && name && classId){
      const existing = await Section.findOne({ name: name.trim(), classId });
      if(existing){
        return res.json({ error: "اسم الشعبة مستخدم مسبقاً في هذا الفصل" });
      } else {
        return res.json({ error: null });
      }
    }

    // تحقق الإدخال النهائي
    if(!classId){
      return res.json({ errors: { classId: "يجب اختيار الفصل" } });
    }

    if(!name || !name.trim()){
      return res.json({ errors: { name: "اسم الشعبة مطلوب" } });
    }

    // إعادة التحقق النهائي قبل الإنشاء
    const existing = await Section.findOne({ name: name.trim(), classId });
    if(existing){
      return res.json({ errors: { name: "اسم الشعبة مستخدم مسبقاً في هذا الفصل" } });
    }

    // إنشاء الشعبة الجديدة
    const newSection = new Section({
      name: name.trim(),
      classId,
      status: status || 'active'
    });

    await newSection.save();
await Class.findByIdAndUpdate(classId, { $push: { sections: newSection._id } });

    req.flash("success", "تم إضافة الشعبة بنجاح");
    return res.json({
  success: "تم إضافة الشعبة بنجاح",
  redirect: "/school-admin/sections"
});

  } catch(err){
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة الشعبة" } });
  }
};

exports.listSectionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    // تأكد أن الفصل تابع لنفس المدرسة
    const classData = await Class.findOne({
      _id: classId,
      schoolId: req.user.schoolId
    });

    if (!classData) {
      req.flash("error", "الفصل غير موجود");
      return res.redirect("/school-admin/section/classes");
    }

    const sections = await Section.find({ classId })
      .populate("classId", "name")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    res.render("dashboard/school-admin/class-sections", {
      title: `شعب فصل ${classData.name}`,
      classData,
      sections
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الشعب");
    res.redirect("/school-admin/classes");
  }
};

exports.getSectionsByClassJSON = async (req, res) => {
  try {
    const { classId } = req.params;

    const sections = await Section.find({
      classId
    }).select("_id name");

    res.json(sections); // ✅ JSON فقط
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};
