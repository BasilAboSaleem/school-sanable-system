const User = require("../models/User");
const { validationResult } = require("express-validator");

// عرض الملف الشخصي
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('schoolId');
        res.render("dashboard/profile/index", { user, title: "الملف الشخصي" });
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في الخادم");
    }
};

// عرض صفحة الإعدادات
exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render("dashboard/profile/settings", { user, title: "إعدادات الحساب" });
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في الخادم");
    }
};

// تحديث البيانات
exports.updateSettings = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("error", errors.array()[0].msg);
            return res.redirect("/profile/settings");
        }

        const { name, email, phone, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.redirect("/auth/login");
        }

        // تحديث الحقول الأساسية
        user.name = name;
        user.email = email;
        user.phone = phone || user.phone;

        // تحديث كلمة المرور فقط إذا تم إرسالها
        if (password && password.trim() !== "") {
            user.password = password; // الموديل سيقوم بالتشفير pre('save')
        }

        await user.save();

        req.flash("success", "تم تحديث البيانات بنجاح");
        res.redirect("/profile");

    } catch (err) {
        console.error(err);
        req.flash("error", "حدث خطأ أثناء التحديث");
        res.redirect("/profile/settings");
    }
};
