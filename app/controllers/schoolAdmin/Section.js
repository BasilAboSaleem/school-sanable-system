const{
    Section,
    Class,
    Student
    
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
  redirect: "/school-admin/classes"
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
      return res.redirect("/school-admin/classes");
    }

    // جلب الشعب المرتبطة بالفصل
    const sections = await Section.find({ classId })
      .populate("classId", "name")
      .sort({ createdAt: -1 });

    // حساب عدد الطلاب لكل شعبة
    const sectionsWithCount = await Promise.all(sections.map(async section => {
      const studentsCount = await Student.countDocuments({ sectionId: section._id, schoolId: req.user.schoolId });
      return { ...section.toObject(), studentsCount };
    }));

    res.render("dashboard/school-admin/section/class-sections", {
      title: `شعب فصل ${classData.name}`,
      classData,
      sections: sectionsWithCount
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

// controllers/schoolAdmin/Section.js
exports.listStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // جلب الشعبة مع الصف المرتبط
    const section = await Section.findById(sectionId).populate("classId");
    if(!section){
      req.flash("error", "الشعبة غير موجودة");
      return res.redirect("/school-admin/classes");
    }

    // تحقق أن الصف مرتبط بنفس المدرسة
    if(section.classId.schoolId.toString() !== req.user.schoolId.toString()){
      req.flash("error", "لا يمكنك الوصول لهذه الشعبة");
      return res.redirect("/school-admin/classes");
    }

    // جلب الطلاب المرتبطين بالشعبة
    const students = await Student.find({ sectionId })
      .populate("classId", "name")
      .populate("sectionId", "name")
      .sort({ fullName: 1 });

    res.render("dashboard/school-admin/student/students-by-section", {
      title: `طلاب شعبة ${section.name}`,
      section,
      students
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الطلاب");
    res.redirect("/school-admin/classes");
  }
};


