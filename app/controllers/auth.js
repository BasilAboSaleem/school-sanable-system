exports.getLogin = (req, res) => {
  res.render("dashboard/auth/login", { title: "تسجيل الدخول" });
};