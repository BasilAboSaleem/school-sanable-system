const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  description: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  incomeType: { 
    type: String, 
    enum: ['financial', 'physical'], // فقط القيم المسموح بها
    required: true 
  },
});

module.exports = mongoose.model("Income", incomeSchema);
