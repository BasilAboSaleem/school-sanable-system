const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // الشعب
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Class", classSchema);
