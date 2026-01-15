const { body } = require("express-validator");
const { strongPasswordRegex } = require("./authValidator");

exports.validateStudent = [
    body("name").trim().notEmpty().withMessage("اسم الطالب مطلوب"),
    body("email").trim().isEmail().withMessage("البريد الإلكتروني غير صالح"),
    body("nationalId").trim().notEmpty().withMessage("رقم الهوية مطلوب"),
    body("gender").isIn(['male', 'female']).withMessage("الجنس غير صالح"),
    body("classId").notEmpty().withMessage("يجب اختيار الصف")
];

exports.validateTeacher = [
    body("name").trim().notEmpty().withMessage("اسم المعلم مطلوب"),
    body("email").trim().isEmail().withMessage("البريد الإلكتروني غير صالح"),
    body("password")
        .optional({ checkFalsy: true }) // Only validate if provided (for edit)
        .custom(value => {
            if (value && !strongPasswordRegex.test(value)) {
                throw new Error("كلمة المرور يجب أن تكون قوية");
            }
            return true;
        }),
    body("phone").trim().notEmpty().withMessage("رقم الهاتف مطلوب"),
    body("salary").isFloat({ min: 0 }).withMessage("الراتب يجب أن يكون رقماً صحيحاً")
];

exports.validateEmployee = [
    body("name").trim().notEmpty().withMessage("اسم الموظف مطلوب"),
    body("email").trim().isEmail().withMessage("البريد الإلكتروني غير صالح"),
    body("phone").trim().notEmpty().withMessage("رقم الهاتف مطلوب"),
    body("jobTitle").trim().notEmpty().withMessage("المسمى الوظيفي مطلوب"),
    body("salary").optional().isFloat({ min: 0 }).withMessage("الراتب يجب أن يكون رقماً موجباً")
];

exports.validateSupplier = [
    body("name").trim().notEmpty().withMessage("اسم المورد مطلوب"),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("البريد الإلكتروني غير صالح"),
    body("phone").optional(),
    body("address").optional()
];
