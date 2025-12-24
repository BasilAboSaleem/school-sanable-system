const{
    Student,
    Class,
    Section
} = require("./utils");



exports.renderCreateStudentForm = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    const sections = await Section.find({ classId: { $in: classes.map(c => c._id) } });
    res.render("dashboard/school-admin/student/add-student", { title: "إضافة طالب جديد", classes, sections });
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
    res.render("dashboard/school-admin/student/all-students", { title: "جميع الطلاب", students });
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
    res.render("dashboard/school-admin/student/show-student", { title: "بيانات الطالب", student });
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

    res.render('dashboard/school-admin/student/edit-student', {
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