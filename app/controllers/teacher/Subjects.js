const Subject = require("../../models/Subject");

exports.showMySubjects = async (req, res) => {
  try {
    // جلب مواد المعلم فقط
    const subjects = await Subject.find({
      _id: { $in: req.user.subjects },
      schoolId: req.user.schoolId
    }).sort({ name: 1 });

    res.render("dashboard/teacher/subjects", {
      subjects,
      error: subjects.length === 0 ? "لا توجد مواد مرتبطة بك حالياً" : null
    });

  } catch (err) {
    console.error(err);
    res.render("dashboard/teacher/subjects", {
      subjects: [],
      error: "حدث خطأ أثناء جلب المواد"
    });
  }
};
