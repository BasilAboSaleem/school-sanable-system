const { body } = require("express-validator");

// Updated to match Income model fields: amount, description, supplierId/Name
exports.validateIncome = [
    body("amount")
        .notEmpty().withMessage("المبلغ مطلوب")
        .isFloat({ min: 0 }).withMessage("المبلغ يجب أن يكون رقماً موجباً"),
    body("description")
         .notEmpty().withMessage("الوصف مطلوب"),
    // supplier validation is complex (depends on 'new' vs id), kept in controller logic or custom validator here if needed
    // For now we validate basic common fields
    body("incomeType")
        .optional()
        .isIn(['financial', 'physical']).withMessage("نوع الوارد غير صحيح")
];

exports.validateExpense = [
    body("amount")
        .notEmpty().withMessage("المبلغ مطلوب")
        .isFloat({ min: 0 }).withMessage("المبلغ يجب أن يكون رقماً موجباً"),
    body("description").optional().trim(),
    // category is used in Expense model
    body("category")
        .notEmpty().withMessage("التصنيف مطلوب")
];
