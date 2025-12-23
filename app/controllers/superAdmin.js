
exports.getAddSchool = (req, res, next) => {
  res.render("dashboard/super-admin/add-school", { title: "إضافة مدرسة جديدة" });
}