const express = require("express");
const router = express.Router();
const profileController = require("../controllers/Profile");
const authorize = require("../middlewares/authorize");
const authValidator = require("../validators/authValidator");

// حماية الراوتس: كل المستخدمين المسجلين يمكنهم الوصول
// نمرر مصفوفة فارغة أو نتحقق فقط من وجود req.user في authorize
// الميدلويير الحالي يطلب مصفوفة أدوار. إذا مررنا مصفوفة تحتوي كل الأدوار؟
// أو نعدل authorize ليقبل "أي مستخدم مسجل"؟
// الكود الحالي: `if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role))`
// إذا مررنا [] (مصفوفة فارغة)، الشرط `allowedRoles.length > 0` يكون False
// وبالتالي يمر دون التحقق من الدور، فقط يتحقق من `!req.user` في البداية.
// إذن: authorize([]) يكفي للسماح لأي مستخدم مسجل.

router.use(authorize([])); 

router.get("/", profileController.getProfile);
router.get("/settings", profileController.getSettings);
router.post("/settings", authValidator.validateProfileUpdate, profileController.updateSettings);

module.exports = router;
