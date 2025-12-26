const Class = require("../../models/Class");
const Section = require("../../models/Section");
const User = require("../../models/User");

exports.showTeacherClasses = async (req, res) => {
  try {
    // جلب الفصول المرتبطة بالمعلم
    const classes = await Class.find({ _id: { $in: req.user.classes } })
      .populate({
        path: 'sections',
        model: 'Section'
      });

    res.render("dashboard/teacher/classes", { classes });
  } catch (err) {
    console.error(err);
    res.render("dashboard/teacher/classes", { classes: [], error: "حدث خطأ أثناء جلب الفصول" });
  }
};
