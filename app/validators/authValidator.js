const { body } = require("express-validator");
const User = require("../models/User");

// Shared regex for strong passwords
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

exports.strongPasswordRegex = strongPasswordRegex;

exports.validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("البريد الإلكتروني مطلوب")
    .isEmail().withMessage("البريد الإلكتروني غير صالح"),
  body("password")
    .notEmpty().withMessage("كلمة المرور مطلوبة"),
];

exports.validateChangePassword = [
  body("currentPassword")
    .notEmpty().withMessage("كلمة المرور الحالية مطلوبة"),
  body("newPassword")
    .notEmpty().withMessage("كلمة المرور الجديدة مطلوبة")
    .custom(value => {
        if (!strongPasswordRegex.test(value)) {
            throw new Error("كلمة المرور يجب أن تكون قوية (8 أحرف، كبير، صغير، رقم، رمز)");
        }
        return true;
    }),
  body("confirmPassword")
    .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("تأكيد كلمة المرور غير متطابق");
        }
        return true;
    })
];

exports.validateProfileUpdate = [
    body("name").trim().notEmpty().withMessage("الاسم مطلوب"),
    body("email")
        .trim().notEmpty().withMessage("البريد الإلكتروني مطلوب")
        .isEmail().withMessage("البريد الإلكتروني غير صالح")
        .custom(async (value, { req }) => {
            // Check uniqueness excluding current user
            const existingUser = await User.findOne({ email: value, _id: { $ne: req.user._id } });
            if (existingUser) {
                throw new Error("البريد الإلكتروني مستخدم بالفعل");
            }
            return true;
        }),
    body("password")
        .optional({ checkFalsy: true })
        .custom(value => {
            if (value && !strongPasswordRegex.test(value)) {
                throw new Error("كلمة المرور يجب أن تكون قوية (8 أحرف، كبير، صغير، رقم، رمز)");
            }
            return true;
        }),
    body("confirmPassword")
        .custom((value, { req }) => {
            if (req.body.password && value !== req.body.password) {
                throw new Error("تأكيد كلمة المرور غير متطابق");
            }
            return true;
        })
];
