const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subject", subjectSchema);
