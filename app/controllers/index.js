const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Supplier = require("../models/Supplier");
const School = require("../models/School");
const User = require("../models/User");

exports.dashboard = async (req, res) => {
  try {
    const user = req.user;
    let stats = {};
    let chartData = {};
    let recentIncomes = [];
    let recentExpenses = [];
    let recentSuppliers = [];
    let recentSchools = [];
    let chartLabels = [];
    let chartIncomes = [];
    let chartExpenses = [];
    let distributionLabels = [];
    let distributionData = [];

    if(user.role === "super-admin") {
      stats.totalSchools = await School.countDocuments();
      stats.totalSuppliers = await Supplier.countDocuments();
      stats.totalIncomes = await Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
      stats.totalExpenses = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
      
      recentIncomes = await Income.find().sort({ createdAt: -1 }).limit(5).populate("supplierId schoolId");
      recentExpenses = await Expense.find().sort({ createdAt: -1 }).limit(5).populate("schoolId incomeId");
      recentSuppliers = await Supplier.find().sort({ createdAt: -1 }).limit(5);
      recentSchools = await School.find().sort({ createdAt: -1 }).limit(5);

      const monthlyIncome = await Income.aggregate([{ $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } }]);
      const monthlyExpense = await Expense.aggregate([{ $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } }]);
      chartLabels = monthlyIncome.map(m => `شهر ${m._id}`);
      chartIncomes = monthlyIncome.map(m => m.total);
      chartExpenses = monthlyExpense.map(m => m.total);
      distributionLabels = ["واردات","صادرات"];
      distributionData = [chartIncomes.reduce((a,b)=>a+b,0), chartExpenses.reduce((a,b)=>a+b,0)];
    }

    if(user.role === "school-admin") {
      stats.totalIncomes = await Income.aggregate([
        { $match: { schoolId: user.schoolId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      stats.totalExpenses = await Expense.aggregate([
        { $match: { schoolId: user.schoolId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      stats.totalTeachers = await User.countDocuments({ schoolId: user.schoolId, role: "teacher" });

      recentIncomes = await Income.find({ schoolId: user.schoolId }).sort({ createdAt: -1 }).limit(5).populate("supplierId");
      recentExpenses = await Expense.find({ schoolId: user.schoolId }).sort({ createdAt: -1 }).limit(5);
      recentSuppliers = await Supplier.find().sort({ createdAt: -1 }).limit(5);

      // Charts
      const monthlyIncome = await Income.aggregate([
        { $match: { schoolId: user.schoolId } },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } }
      ]);
      const monthlyExpense = await Expense.aggregate([
        { $match: { schoolId: user.schoolId } },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } }
      ]);
      chartLabels = monthlyIncome.map(m => `شهر ${m._id}`);
      chartIncomes = monthlyIncome.map(m => m.total);
      chartExpenses = monthlyExpense.map(m => m.total);
      distributionLabels = ["واردات","صادرات"];
      distributionData = [chartIncomes.reduce((a,b)=>a+b,0), chartExpenses.reduce((a,b)=>a+b,0)];
    }

    if(user.role === "teacher") {
      recentIncomes = await Income.find({ createdBy: user._id }).sort({ createdAt: -1 }).limit(5);
      recentExpenses = await Expense.find({ createdBy: user._id }).sort({ createdAt: -1 }).limit(5);
    }

    return res.render("index", {
      user, stats, chartData,
      recentIncomes, recentExpenses,
      recentSuppliers, recentSchools,
      chartLabels, chartIncomes, chartExpenses,
      distributionLabels, distributionData
    });

  } catch(err) {
    console.error(err);
    res.redirect("/login");
  }
};
