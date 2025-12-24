const Class = require("../models/Class");
const Section = require('../models/Section');
const Subject = require("../models/Subject");
const User = require("../models/User");
const Student = require("../models/Student");


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

exports.renderEditClassForm = async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });

    if (!cls) {
      req.flash("error", "الفصل غير موجود");
      return res.redirect("/school-admin/classes");
    }

    res.render("dashboard/school-admin/edit-class", {
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
  success: "تم تعديل الفصل بنجاح",
  redirect: "/school-admin/classes"
});

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء تعديل الفصل" } });
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


exports.renderCreateSubjectForm = (req, res) => {
  res.render("dashboard/school-admin/add-subject", { title: "إضافة مادة جديدة" });
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

    res.render("dashboard/school-admin/all-subject", {
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

    res.render("dashboard/school-admin/edit-subject", {
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

// عرض صفحة إضافة مدرس
exports.renderCreateTeacherForm = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    const subjects = await Subject.find({ schoolId: req.user.schoolId });
    res.render("dashboard/school-admin/add-teacher", {
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

    res.render("dashboard/school-admin/all-teachers", {
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

    res.render("dashboard/school-admin/edit-teacher", {
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

exports.renderCreateStudentForm = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    const sections = await Section.find({ classId: { $in: classes.map(c => c._id) } });
    res.render("dashboard/school-admin/add-student", { title: "إضافة طالب جديد", classes, sections });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب البيانات");
    res.redirect("/school-admin");
  }
};

// Handle create student POST
exports.createStudent = async (req, res) => {
  const { fullName, phoneOfParents, address, dateOfBirth, gender, classId, sectionId, status } = req.body;
  try {
    if(!fullName || !fullName.trim()) return res.json({ errors: { fullName: "اسم الطالب مطلوب" } });
    if(!classId) return res.json({ errors: { classId: "يجب اختيار الفصل" } });
    if(!sectionId) return res.json({ errors: { sectionId: "يجب اختيار الشعبة" } });

    const newStudent = new Student({
      fullName: fullName.trim(),
      phoneOfParents,
      address,
      dateOfBirth,
      gender,
      schoolId: req.user.schoolId,
      classId,
      sectionId,
      status: status || 'active'
    });

    await newStudent.save();
    return res.json({ success: "تم إضافة الطالب بنجاح", redirect: "/school-admin/students" });
  } catch(err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة الطالب" } });
  }
};

exports.listStudents = async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.user.schoolId })
      .populate("classId", "name")
      .populate("sectionId", "name")
      .sort({ createdAt: -1 });
    res.render("dashboard/school-admin/all-students", { title: "جميع الطلاب", students });
  } catch(err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب الطلاب");
    res.redirect("/school-admin");
  }
};

exports.viewStudentDetails = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
      .populate("classId", "name")
      .populate("sectionId", "name");
    if (!student) {
      req.flash("error", "لم يتم العثور على الطالب");
      return res.redirect("/school-admin/students");
    }
    res.render("dashboard/school-admin/show-student", { title: "بيانات الطالب", student });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الطالب");
    res.redirect("/school-admin/students");
  }
};

exports.renderEditStudentForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classId')
      .populate('sectionId');

    const classes = await Class.find({ schoolId: req.user.schoolId });

    let sections = [];
    if (student.classId) {
      sections = await Section.find({ classId: student.classId._id });
    }

    res.render('dashboard/school-admin/edit-student', {
      student,
      classes,
      sections
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات الطالب');
    res.redirect('/school-admin/students');
  }
};


exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      req.flash('error', 'الطالب غير موجود');
      return res.redirect('/school-admin/students');
    }

    // تحديث الحقول النصية والباقية كما هي
    student.fullName = req.body.fullName || student.fullName;
    student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
    student.gender = req.body.gender || student.gender;
    student.phoneOfParents = req.body.phoneOfParents || student.phoneOfParents;
    student.address = req.body.address || student.address;
    //student.grade = req.body.grade || student.grade;
    if (req.body.grade !== undefined) {
  student.grade = req.body.grade;
}

    // تحديث الفصول والشعب فقط إذا تم اختيارها
    if (req.body.classId && req.body.classId.trim() !== "") {
      student.classId = req.body.classId;
    }

    if (req.body.sectionId && req.body.sectionId.trim() !== "") {
      student.sectionId = req.body.sectionId;
    }

    await student.save();

    req.flash('success', 'تم تحديث بيانات الطالب بنجاح');
    res.redirect(`/school-admin/students/${student._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء تحديث بيانات الطالب');
    res.redirect('/school-admin/students');
  }
};
