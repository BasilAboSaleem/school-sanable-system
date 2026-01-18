const{
    Student,
    Class,
    Section,
    Grade,
    User,
    ParentProfile
} = require("./utils");
const XLSX = require("xlsx");



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
    if (phoneOfParents) {
      // تحقق من وجود User parent حسب الهاتف
      let parentUser = await User.findOne({ phone: phoneOfParents, role: "parent" });

      if (!parentUser) {
        // إنشاء Parent User جديد
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
      }

      // تحقق أو إنشاء ParentProfile مرتبط بالمدرسة
      let parentProfile = await ParentProfile.findOne({
        userId: parentUser._id,
        schoolId: req.user.schoolId
      });

      if (!parentProfile) {
        parentProfile = new ParentProfile({
          userId: parentUser._id,
          phone: phoneOfParents,
          schoolId: req.user.schoolId,
          students: [newStudent._id]
        });

        await parentProfile.save();
      } else {
        // إضافة الطالب للقائمة إذا موجود Profile
        await ParentProfile.findByIdAndUpdate(parentProfile._id, {
          $addToSet: { students: newStudent._id }
        });
      }
    }

    return res.json({
      success: "تم إضافة الطالب وانشاء حساب ولي الأمر بنجاح",
      redirect: "/school-admin/students"
    });

  } catch (err) {
    console.error(err);
    return res.json({ errors: { general: "حدث خطأ أثناء إضافة الطالب" } });
  }
};

exports.renderImportExcelForm = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    const sections = await Section.find({ classId: { $in: classes.map(c => c._id) } });
    res.render("dashboard/school-admin/student/import-excel", { title: "استيراد طلاب من ملف Excel", classes, sections, csrfToken: req.csrfToken() });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب البيانات");
    res.redirect("/school-admin");
  }
};

exports.importStudentsExcel = async (req, res) => {
  try {
    const { classId, sectionId } = req.body;

    // ====== VALIDATIONS ======
    if (!req.file)
      return res.json({ error: "يرجى رفع ملف Excel" });

    if (!classId || !sectionId)
      return res.json({ error: "الفصل والشعبة مطلوبة" });

    const cls = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
    if (!cls) return res.json({ error: "الفصل غير صالح" });

    const section = await Section.findOne({ _id: sectionId, classId });
    if (!section) return res.json({ error: "الشعبة غير صالحة" });

    // ====== READ EXCEL ======
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let studentsToInsert = [];
    let skippedRows = 0;

    // ====== PREPARE STUDENTS ======
    for (const row of rows) {
      if (!row.fullName || !row.phoneOfParents) {
        skippedRows++;
        continue;
      }

      // ====== GENDER TRANSFORM ======
      let gender = undefined;
      if (row.gender) {
        const g = row.gender.toString().trim().toLowerCase();
        if (g === "male" || g === "ذكر") gender = "Male";
        else if (g === "female" || g === "أنثى") gender = "Female";
      }

      // ====== AGE CALCULATION ======
      let age = undefined;
      let dateOfBirth = undefined;
      if (row.dateOfBirth) {
        dateOfBirth = new Date(row.dateOfBirth);
        if (!isNaN(dateOfBirth)) {
          const diff = Date.now() - dateOfBirth.getTime();
          age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }
      } else if (row.age) {
        age = Number(row.age);
      }

      const student = {
        fullName: row.fullName.toString().trim(),
        nationalId: row.nationalId?.toString(),
        phoneOfParents: row.phoneOfParents.toString().trim(),
        address: row.address,
        dateOfBirth,
        age,
        gender,
        schoolId: req.user.schoolId,
        classId,
        sectionId,
        status: "active",
        createdFrom: "excel"
      };

      studentsToInsert.push(student);
    }

    if (!studentsToInsert.length) {
      return res.json({ error: "لا يوجد طلاب صالحين للاستيراد" });
    }

    // ====== INSERT STUDENTS ======
    const insertedStudents = await Student.insertMany(studentsToInsert);

    // ====== CREATE / LINK PARENTS ======
    for (const student of insertedStudents) {
      const phone = student.phoneOfParents;

      let parentUser = await User.findOne({ phone, role: "parent" });

      if (!parentUser) {
        parentUser = await User.create({
          name: `ولي أمر ${student.fullName}`,
          email: `${phone}@school.com`,
          password: `School@${phone}`,
          role: "parent",
          phone
        });
      }

      await ParentProfile.findOneAndUpdate(
        { userId: parentUser._id, schoolId: req.user.schoolId },
        { phone, $addToSet: { students: student._id } },
        { upsert: true, new: true }
      );
    }

    return res.json({
      success: "تم استيراد الطلاب بنجاح",
      totalRows: rows.length,
      imported: insertedStudents.length,
      skipped: skippedRows
    });

  } catch (err) {
    console.error(err);
    return res.json({ error: "حدث خطأ أثناء استيراد ملف Excel" });
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

    // ====== تحديث بيانات الطالب ======
    student.fullName = req.body.fullName || student.fullName;
    student.nationalId = req.body.nationalId || student.nationalId;
    student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
    student.gender = req.body.gender || student.gender;
    student.address = req.body.address || student.address;

    // تحقق من تغيير رقم ولي الأمر
    const newPhone = req.body.phoneOfParents?.trim();
    if (newPhone && newPhone !== student.phoneOfParents) {
      const oldPhone = student.phoneOfParents;
      student.phoneOfParents = newPhone;

      // ====== تحديث حساب ولي الأمر ======
      let parentUser = await User.findOne({ phone: oldPhone, role: "parent" });
      if (parentUser) {
        parentUser.phone = newPhone;
        parentUser.email = `${newPhone}@school.com`;
        parentUser.password = `School@${newPhone}`; // سيتم هاش تلقائياً
        await parentUser.save();

        // ====== تحديث ParentProfile ======
        const parentProfile = await ParentProfile.findOne({ userId: parentUser._id });
        if (parentProfile) {
          parentProfile.phone = newPhone;
          await parentProfile.save();
        }
      }
    }

    // ====== تحديث الفصل والشعبة ======
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

