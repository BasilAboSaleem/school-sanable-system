const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getLogin = (req, res) => {
  res.render("dashboard/auth/login", { title: "تسجيل الدخول" });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  try {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
       req.flash("error", errors.array()[0].msg);
       return res.redirect("/auth/login");
    }

    const { email, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "البريد الإلكتروني أو كلمة المرور خاطئة");
      return res.redirect("/auth/login");
    }

    // التحقق من كلمة المرور باستخدام comparePassword من الموديل
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash("error", "البريد الإلكتروني أو كلمة المرور خاطئة");
      return res.redirect("/auth/login");
    }

    // إنشاء JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, schoolId: user.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // حفظ التوكن في cookie
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    
    return res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).send("حدث خطأ في الخادم");
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
};
