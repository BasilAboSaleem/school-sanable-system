const Class = require("../models/Class");
const Section = require('../models/Section');


exports.renderCreateClassForm = (req, res) => {
  res.render("dashboard/school-admin/add-class", { title: "إضافة فصل جديد" });
  
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
  success: "تم إضافة الفصل بنجاح",
  redirect: "/school-admin/classes"
});

   

  } catch(err){
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة الفصل" } });
  }
};

exports.listClasses = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId }).populate('sections').sort({ createdAt: -1 });
    res.render("dashboard/school-admin/all-classes", { title: "جميع الفصول", classes });
  } catch(err){
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الفصول");
    res.redirect("/school-admin");
  }
};


exports.renderCreateSectionForm = async (req, res) => {
    const classes = await Class.find({ schoolId: req.user.schoolId });
  res.render("dashboard/school-admin/add-section", { title: "إضافة شعبة جديدة", classes });
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