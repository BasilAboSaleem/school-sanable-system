const{
    Expense,
    Supplier,
    Income,
    School,
    
} = require("./utils");


exports.listInstitutionExports = async (req, res) => {
  try {
    // جلب كل الصادرات الخاصة بالمؤسسة
    const exportsList = await Expense.find({ source: "institution" })
      .populate({
        path: 'incomeId', // افترض أن الصادرات مربوطة بالوارد
        select: 'supplierId description amount', 
        populate: { path: 'supplierId', select: 'name' } // نجيب المورد من الوارد
      })
      .populate('schoolId', 'name')
      .lean();

    res.render('dashboard/super-admin/expense/expenses', { exportsList });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: 'حدث خطأ أثناء جلب الصادرات' } });
  }
};

// جلب كل المدارس مع الصادرات التي أنشأتها المدرسة نفسها
exports.listSchoolExpenses = async (req, res) => {
  try {
    const schools = await School.find().lean();

    for (let school of schools) {
      // جلب الصادرات التي أنشأتها المدرسة نفسها فقط
      const expenses = await Expense.find({ 
        source: "school", 
        schoolId: school._id 
      }).populate('incomeId').lean();

      school.expenses = expenses;
    }

    res.render("dashboard/super-admin/expense/school-expenses", { schools });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: 'حدث خطأ أثناء جلب الصادرات' } });
  }
};






