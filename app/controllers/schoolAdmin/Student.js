const{
    Student,
    Class,
    Section,
    Grade,
    User,
    ParentProfile
} = require("./utils");
const XLSX = require("xlsx");
const fs = require('fs');
const path = require('path');
const axios = require('axios'); 

function normalizeArabicText(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .trim()
    .replace(/\u00A0/g, " ")
    .replace(/[\u0623\u0625\u0622]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .replace(/\s+/g, " ");
}

function cleanCellValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getRowValue(row, possibleKeys) {
  for (const key of possibleKeys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = cleanCellValue(row[key]);
      if (value !== "") return value;
    }
  }

  const normalizedEntries = Object.entries(row).map(([key, value]) => [
    normalizeArabicText(key),
    cleanCellValue(value)
  ]);

  for (const key of possibleKeys) {
    const normalizedKey = normalizeArabicText(key);
    const found = normalizedEntries.find(([entryKey, entryValue]) =>
      entryKey === normalizedKey && entryValue !== ""
    );
    if (found) return found[1];
  }

  return "";
}

function parseGender(value) {
  const raw = cleanCellValue(value).toLowerCase();
  const normalized = normalizeArabicText(value).toLowerCase();

  if (!raw && !normalized) return undefined;
  if (
    raw.includes("\u0630\u0643\u0631") ||
    normalized.includes("\u0630\u0643\u0631") ||
    raw === "male" ||
    normalized === "male" ||
    raw === "m" ||
    normalized === "m"
  ) return "Male";
  if (
    raw.includes("\u0648\u0644\u062F") ||
    normalized.includes("\u0648\u0644\u062F")
  ) return "Male";
  if (
    /[\u0627\u0623\u0625\u0622]?\u0646\u062B[\u0649\u064A]/.test(raw) ||
    /[\u0627\u0623\u0625\u0622]?\u0646\u062B[\u0649\u064A]/.test(normalized) ||
    raw === "female" ||
    normalized === "female" ||
    raw === "f" ||
    normalized === "f"
  ) return "Female";
  if (
    raw.includes("\u0628\u0646\u062A") ||
    normalized.includes("\u0628\u0646\u062A")
  ) return "Female";

  return undefined;
}

function parseHealthStatus(value) {
  const normalized = normalizeArabicText(value).toLowerCase();

  if (!normalized) return true;
  if (
    normalized.includes("غير سليم") ||
    normalized.includes("غير صحي") ||
    normalized.includes("مريض") ||
    normalized.includes("يعاني") ||
    normalized === "لا"
  ) {
    return false;
  }

  if (
    normalized.includes("سليم") ||
    normalized.includes("صحي") ||
    normalized === "نعم"
  ) {
    return true;
  }

  return true;
}

function parseOrphanStatus(value) {
  const normalized = normalizeArabicText(value).toLowerCase();

  if (!normalized) return false;
  if (
    normalized.includes("غير يتيم") ||
    normalized.includes("ليس يتيم") ||
    normalized === "لا"
  ) {
    return false;
  }

  if (normalized.includes("يتيم") || normalized === "نعم") {
    return true;
  }

  return false;
}

function parseStudentStatus(value) {
  const normalized = normalizeArabicText(value).toLowerCase();

  if (!normalized) return "active";
  if (
    normalized.includes("غير معتمد") ||
    normalized.includes("غير فعال") ||
    normalized.includes("موقوف") ||
    normalized.includes("inactive")
  ) {
    return "inactive";
  }

  return "active";
}

function parseExcelDate(value) {
  if (!value && value !== 0) return undefined;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return undefined;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  const text = cleanCellValue(value);
  if (!text) return undefined;

  const directDate = new Date(text);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  const match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, part1, part2, year] = match;
    return new Date(Number(year), Number(part2) - 1, Number(part1));
  }

  return undefined;
}


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
    nameOfParent,
    nationalIdOfParent,
    isHealthy,
    isOrphan,
    age,
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
      nameOfParent: nameOfParent ? nameOfParent.trim() : undefined,
      nationalIdOfParent: nationalIdOfParent ? nationalIdOfParent.trim() : undefined,
      phoneOfParents: phoneOfParents.trim(),
      isHealthy,
      isOrphan,
      address,
      dateOfBirth,
      age: age ? Number(age) : undefined,
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

function getDriveFileId(url) {
  const match = url.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
}

exports.importStudentsExcel = async (req, res) => {
  let filePath;

  try {
    let {
      classId,
      sectionId,
      driveUrl,
      importType,
      startRow,
      endRow
    } = req.body;

    if (!classId || !sectionId)
      return res.json({ error: "الفصل والشعبة مطلوبة" });

    const cls = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
    if (!cls) return res.json({ error: "الفصل غير صالح" });

    const section = await Section.findOne({ _id: sectionId, classId });
    if (!section) return res.json({ error: "الشعبة غير صالحة" });

    // ===== جلب الملف =====
    if (importType === 'drive') {
      if (!driveUrl)
        return res.json({ error: "يرجى إدخال رابط Google Drive" });

      const fileId = getDriveFileId(driveUrl);
      if (!fileId)
        return res.json({ error: "رابط Google Drive غير صالح" });

      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      filePath = path.join(__dirname, '../../tmp/import.xlsx');

      const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'stream'
      });

      await new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        response.data.pipe(stream);
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

    } else {
      if (!req.file)
        return res.json({ error: "يرجى رفع ملف Excel" });
      filePath = req.file.path;
    }

    // ===== قراءة الإكسل =====
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // ===== تطبيق النطاق =====
    startRow = parseInt(startRow) || 1;
    endRow = parseInt(endRow) || rows.length;

    if (startRow < 1) startRow = 1;
    if (endRow > rows.length) endRow = rows.length;
    if (startRow > endRow)
      return res.json({ error: "نطاق الصفوف غير صالح" });

    rows = rows.slice(startRow - 1, endRow);

    const studentsToInsert = [];
    let skippedRows = 0;

    for (const row of rows) {
      const fullName = getRowValue(row, ["اسم الطالب", "اسم الطالبه", "اسم الطالب رباعي"]);
      const phoneOfParents = getRowValue(row, ["رقم الجوال", "الجوال", "رقم الهاتف", "هاتف ولي الامر"]);

      if (!fullName || !phoneOfParents) {
        skippedRows++;
        continue;
      }

      const gender = parseGender(getRowValue(row, ["الجنس"]));
      const nationalId = getRowValue(row, ["هوية الطالب", "رقم هوية الطالب", "الهوية"]);
      const nameOfParent = getRowValue(row, ["ولي الأمر", "ولي الامر", "اسم ولي الأمر", "اسم ولي الامر"]);
      const nationalIdOfParent = getRowValue(row, ["هوية ولي الأمر", "هوية ولي الامر", "رقم هوية ولي الأمر"]);
      const dateOfBirth = parseExcelDate(getRowValue(row, ["تاريخ الميلاد", "تاريخ ولادة الطالب"]));
      const healthStatus = getRowValue(row, ["الحالة الصحية", "الحاله الصحيه"]);
      const orphanStatus = getRowValue(row, ["حالة اليتم", "حاله اليتم"]);
      const studentStatus = getRowValue(row, ["حالة الطالب", "حاله الطالب"]);
      const address = getRowValue(row, ["العنوان", "السكن"]);
      const ageValue = getRowValue(row, ["العمر", "سن الطالب"]);

      studentsToInsert.push({
        fullName,
        nationalId: nationalId || undefined,
        phoneOfParents,
        nameOfParent: nameOfParent || undefined,
        nationalIdOfParent: nationalIdOfParent || undefined,
        isHealthy: parseHealthStatus(healthStatus),
        isOrphan: parseOrphanStatus(orphanStatus),
        address: address || undefined,
        dateOfBirth,
        age: ageValue ? Number(ageValue) || undefined : undefined,
        schoolId: req.user.schoolId,
        classId,
        sectionId,
        gender,
        status: parseStudentStatus(studentStatus),
        createdFrom: 'excel'
      });
    }

    if (!studentsToInsert.length)
      return res.json({ error: "لا يوجد طلاب صالحين للاستيراد" });

    const insertedStudents = await Student.insertMany(studentsToInsert);

    if (filePath && fs.existsSync(filePath))
      fs.unlinkSync(filePath);

    return res.json({
      success: "تم استيراد الطلاب بنجاح",
      totalRows: rows.length,
      imported: insertedStudents.length,
      skipped: skippedRows
    });

  } catch (err) {
    console.error(err);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
    // console.log("Student ID:", req.params.id);
    // console.log("School ID:", req.user.schoolId);

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

    // console.log("Grades fetched:", grades.length);

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
      const msg = "الطالب غير موجود";
      if (req.xhr || req.headers.accept.includes("json")) {
        return res.status(404).json({ errors: { general: msg } });
      }
      req.flash("error", msg);
      return res.redirect("/school-admin/students");
    }

    // ====== تحديث بيانات الطالب ======
    student.fullName = req.body.fullName || student.fullName;
    student.nameOfParent = req.body.nameOfParent || student.nameOfParent;
    student.nationalIdOfParent = req.body.nationalIdOfParent || student.nationalIdOfParent;
    student.isHealthy = typeof req.body.isHealthy !== 'undefined' ? req.body.isHealthy === true || req.body.isHealthy === 'true' : student.isHealthy;
    student.isOrphan = typeof req.body.isOrphan !== 'undefined' ? req.body.isOrphan === true || req.body.isOrphan === 'true' : student.isOrphan;
    student.nationalId = req.body.nationalId || student.nationalId;
    student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
    student.age = req.body.age ? Number(req.body.age) : student.age;
    student.gender = req.body.gender || student.gender;
    student.address = req.body.address || student.address;
    student.phoneOfParents = req.body.phoneOfParents || student.phoneOfParents;

    // ====== تحقق من تغيير رقم ولي الأمر ======
    const newPhone = req.body.phoneOfParents?.trim();
    if (newPhone && newPhone !== student.phoneOfParents) {
      const oldPhone = student.phoneOfParents;
      student.phoneOfParents = newPhone;

      const parentUser = await User.findOne({ phone: oldPhone, role: "parent" });
      if (parentUser) {
        parentUser.phone = newPhone;
        parentUser.email = `${newPhone}@school.com`;
        parentUser.password = `School@${newPhone}`;
        await parentUser.save();

        const parentProfile = await ParentProfile.findOne({ userId: parentUser._id });
        if (parentProfile) {
          parentProfile.phone = newPhone;
          await parentProfile.save();
        }
      }
    }

    // ====== تحديث الفصل والشعبة ======
    if (req.body.classId) {
      const cls = await Class.findOne({ _id: req.body.classId, schoolId: req.user.schoolId });
      if (cls) student.classId = cls._id;
    }

    if (req.body.sectionId) {
      const section = await Section.findOne({ _id: req.body.sectionId, classId: student.classId });
      if (section) student.sectionId = section._id;
    }

    await student.save();

    // ===== إرجاع JSON دائماً عند AJAX =====
    if (req.xhr || req.headers.accept.includes("json")) {
      return res.json({
        redirect: `/school-admin/students/${student._id}`
      });
    }

    // للطلبات العادية
    req.flash("success", "تم تحديث بيانات الطالب بنجاح");
    res.redirect(`/school-admin/students/${student._id}`);

  } catch (err) {
    console.error(err);
    const errorMsg = "حدث خطأ أثناء تحديث بيانات الطالب";
    if (req.xhr || req.headers.accept.includes("json")) {
      return res.status(500).json({ errors: { general: errorMsg } });
    }
    req.flash("error", errorMsg);
    res.redirect("/school-admin/students");
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // جلب الطالب
    const student = await Student.findById(studentId);

    if (!student) {
      req.flash("error", "الطالب غير موجود");
      return res.redirect("/school-admin/students");
    }

    // أمان: نفس المدرسة
    if (student.schoolId.toString() !== req.user.schoolId.toString()) {
      req.flash("error", "غير مصرح لك بحذف هذا الطالب");
      return res.redirect("/school-admin/students");
    }

    /* =========================
       1️⃣ حذف العلامات
    ========================== */
    await Grade.deleteMany({ studentId: student._id });

    /* =========================
       2️⃣ إزالة الطالب من الشعبة
    ========================== */
    await Section.updateOne(
      { _id: student.sectionId },
      { $pull: { students: student._id } }
    );

    /* =========================
       3️⃣ التعامل مع ولي الأمر
    ========================== */
    const parentProfiles = await ParentProfile.find({
      students: student._id
    });

    for (const profile of parentProfiles) {

      // إزالة الطالب من قائمة الطلاب
      profile.students.pull(student._id);
      await profile.save();

      // التحقق إذا بقي له طلاب
      if (profile.students.length === 0) {

        // حذف ParentProfile
        await ParentProfile.findByIdAndDelete(profile._id);

        // تحقق هل يوجد له ParentProfile آخر في مدارس أخرى
        const otherProfiles = await ParentProfile.find({
          userId: profile.userId
        });

        if (otherProfiles.length === 0) {
          // حذف حساب ولي الأمر نفسه
          await User.findByIdAndDelete(profile.userId);
        }
      }
    }

    /* =========================
       4️⃣ حذف الطالب
    ========================== */
    await Student.findByIdAndDelete(student._id);

    req.flash("success", "تم حذف الطالب بنجاح");
    res.redirect("/school-admin/students");

  } catch (error) {
    console.error(error);
    req.flash("error", "حدث خطأ أثناء حذف الطالب");
    res.redirect("/school-admin/students");
  }
};
