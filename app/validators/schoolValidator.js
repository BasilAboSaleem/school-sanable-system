const { body } = require('express-validator');
const { School, User, strongPasswordRegex } = require('../controllers/superAdmin/utils');

exports.validateAddSchool = [
  body('name')
    .trim()
    .notEmpty().withMessage('اسم المدرسة مطلوب')
    .custom(async (value) => {
      const school = await School.findOne({ name: value });
      if (school) {
        throw new Error('اسم المدرسة مستخدم مسبقًا');
      }
    }),
  body('code')
    .trim()
    .notEmpty().withMessage('كود المدرسة مطلوب')
    .custom(async (value) => {
      const school = await School.findOne({ code: value });
      if (school) {
        throw new Error('كود المدرسة مستخدم مسبقًا');
      }
    }),
  body('adminName').trim().notEmpty().withMessage('اسم المدير مطلوب'),
  body('adminEmail')
    .trim()
    .notEmpty().withMessage('البريد الإلكتروني مطلوب')
    .isEmail().withMessage('البريد الإلكتروني غير صالح')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('البريد الإلكتروني مستخدم مسبقًا');
      }
    }),
  body('adminPassword')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
    .custom((value) => {
      if (!strongPasswordRegex.test(value)) {
        throw new Error('كلمة المرور يجب أن تكون قوية (8 أحرف، كبير، صغير، رقم، رمز)');
      }
      return true;
    }),
];

exports.validateEditSchool = [
    body('name')
      .trim()
      .notEmpty().withMessage('اسم المدرسة مطلوب')
      .custom(async (value, { req }) => {
        const school = await School.findOne({ name: value, _id: { $ne: req.params.id } });
        if (school) {
          throw new Error('اسم المدرسة مستخدم مسبقًا');
        }
      }),
    body('code')
      .trim()
      .notEmpty().withMessage('كود المدرسة مطلوب')
      .custom(async (value, { req }) => {
        const school = await School.findOne({ code: value, _id: { $ne: req.params.id } });
        if (school) {
          throw new Error('كود المدرسة مستخدم مسبقًا');
        }
      }),
    body('adminEmail')
      .optional({ checkFalsy: true })
      .isEmail().withMessage('البريد الإلكتروني غير صالح')
  ];
