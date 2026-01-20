const Class = require("../../models/Class");
const Section = require("../../models/Section");
const User = require("../../models/User");



exports.showTeacherClasses = async (req, res) => {
  try {
    // جلب جميع الشعب الخاصة بالمعلم
    const teacherSections = await Section.find({ _id: { $in: req.user.sections } });
    // console.log(teacherSections);

    // استخراج جميع معرفات الفصول من الشعب
    const classIds = teacherSections.map(sec => sec.classId.toString());
    // console.log(classIds);

    // جلب جميع الفصول الخاصة بهذه الشعب
    const classes = await Class.find({ _id: { $in: classIds } });
    // console.log(classes);

    // ربط كل فصل بالشعب الخاصة بالمعلم
    const classesWithSections = classes.map(cls => {
      const filteredSections = teacherSections.filter(sec => sec.classId.toString() === cls._id.toString());
      return {
        _id: cls._id,
        name: cls.name,
        sections: filteredSections
      };
    });
    // console.log(classesWithSections);

    res.render("dashboard/teacher/classes", {
      classes: classesWithSections,
      error: classesWithSections.length === 0 ? "لا يوجد فصول أو شعب مرتبطة بك" : null
    });

  } catch (err) {
    console.error(err);
    res.render("dashboard/teacher/classes", {
      classes: [],
      error: "حدث خطأ أثناء جلب الفصول"
    });
  }
};