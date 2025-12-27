const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String },
  description: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    source: {
    type: String,
    enum: ["institution", "school"],
    default: "school"
  },
  incomeId: { type: mongoose.Schema.Types.ObjectId, ref: "Income", default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", expenseSchema);
