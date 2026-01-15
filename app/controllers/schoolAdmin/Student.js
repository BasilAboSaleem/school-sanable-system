const{
    Student,
    Class,
    Section,
    Grade,
    User,
    ParentProfile
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
  const {
    fullName,
    nationalId,
    phoneOfParents,
    address,
    dateOfBirth,
    gender,
    classId,
    sectionId,
    status
  } = req.body;

  try {
    // ====== VALIDATIONS ======
    if (!fullName || !fullName.trim())
      return res.json({ errors: { fullName: "اسم الطالب مطلوب" } });

    if (!classId)
      return res.json({ errors: { classId: "يجب اختيار الفصل" } });

    if (!sectionId)
      return res.json({ errors: { sectionId: "يجب اختيار الشعبة" } });

    // تحقق أن الفصل تابع للمدرسة
    const cls = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
    if (!cls)
      return res.json({ errors: { classId: "الفصل غير صالح" } });

    // تحقق أن الشعبة تابعة للفصل
    const section = await Section.findOne({ _id: sectionId, classId });
    if (!section)
      return res.json({ errors: { sectionId: "الشعبة غير تابعة لهذا الفصل" } });

    // ====== CREATE STUDENT ======
    const newStudent = new Student({
      fullName: fullName.trim(),
      nationalId: nationalId ? nationalId.trim() : undefined,
      phoneOfParents,
      address,
      dateOfBirth,
      gender,
      schoolId: req.user.schoolId,
      classId,
      sectionId,
      status: ["active", "inactive"].includes(status) ? status : "active",
      createdFrom: "manual"
    });

    await newStudent.save();

    // ====== CREATE / LINK PARENT ======
    if (phoneOfParents && nationalId) {
      let parentUser = await User.findOne({ phone: phoneOfParents, role: "parent" });

      if (!parentUser) {
        // إنشاء Parent جديد
        const email = `${phoneOfParents}@school.com`;
        const password = `School@${phoneOfParents}`;

        parentUser = new User({
          name: `ولي أمر ${fullName}`,
          email,
          password,
          role: "parent",
          phone: phoneOfParents
        });

        await parentUser.save();

        // إنشاء ParentProfile وربط الطالب
        const parentProfile = new ParentProfile({
          userId: parentUser._id,
          phone: phoneOfParents,
          students: [newStudent._id]
        });

        await parentProfile.save();
      } else {
        // لو Parent موجود مسبقًا → أضف الطالب للقائمة
        await ParentProfile.findOneAndUpdate(
          { userId: parentUser._id },
          { $addToSet: { students: newStudent._id } }
        );
      }
    }

    return res.json({
      success: "تم إضافة الطالب وانشاء حساب ولي الامر بنجاح",
      redirect: "/school-admin/students"
    });

  } catch (err) {
    console.error(err);
    return res.json({
      errors: { general: "حدث خطأ أثناء إضافة الطالب" }
    });
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
    console.log("Student ID:", req.params.id);
    console.log("School ID:", req.user.schoolId);

    const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
      .populate("classId", "name")
      .populate("sectionId", "name");

    if (!student) {
      req.flash("error", "لم يتم العثور على الطالب");
      return res.redirect("/school-admin/students");
    }

    const grades = await Grade.find({ studentId: student._id })
      .populate("subjectId", "name")
      .populate("examId", "title date")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    console.log("Grades fetched:", grades.length);

    res.render("dashboard/school-admin/student/show-student", {
      title: "بيانات الطالب",
      student,
      grades
    });
  } catch (err) {
    console.error("Error fetching student details:", err);
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
    const student = await Student.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId
    });

    if (!student) {
      req.flash("error", "الطالب غير موجود");
      return res.redirect("/school-admin/students");
    }

    student.fullName = req.body.fullName || student.fullName;
    student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
    student.gender = req.body.gender || student.gender;
    student.phoneOfParents = req.body.phoneOfParents || student.phoneOfParents;
    student.address = req.body.address || student.address;

    if (req.body.classId) {
      const cls = await Class.findOne({
        _id: req.body.classId,
        schoolId: req.user.schoolId
      });
      if (cls) student.classId = cls._id;
    }

    if (req.body.sectionId) {
      const section = await Section.findOne({
        _id: req.body.sectionId,
        classId: student.classId
      });
      if (section) student.sectionId = section._id;
    }

    await student.save();

    req.flash("success", "تم تحديث بيانات الطالب بنجاح");
    res.redirect(`/school-admin/students/${student._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحديث بيانات الطالب");
    res.redirect("/school-admin/students");
  }
};
