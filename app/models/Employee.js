const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  jobTitle: { type: String },
  address: { type: String },
  salary: { type: Number },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employee", employeeSchema);
