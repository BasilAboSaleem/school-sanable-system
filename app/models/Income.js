const mongoose = require("mongoose");
const Supplier = require("./Supplier");

const incomeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  description: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Income", incomeSchema);
