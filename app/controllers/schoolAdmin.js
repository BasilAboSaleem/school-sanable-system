const Class = require("../models/Class");

exports.renderCreateClassForm = (req, res) => {
  res.render("dashboard/school-admin/add-class", { title: "إضافة فصل جديد" });
  
}

exports.createClass = async (req, res) => {
  const { name, status, checkField } = req.body;
  const schoolId = req.user.schoolId;

  try {
    // التحقق من الاسم الفريد
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

    // إنشاء الفصل الجديد
    const newClass = new Class({
      name: name.trim(),
      schoolId,
      status: status || 'active'
    });

    await newClass.save();

    req.flash("success", "تم إضافة الفصل بنجاح");
    return res.redirect("/school-admin/classes");

  } catch(err){
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة الفصل" } });
  }
};