const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
    nationalId: {type: String,index: true },
  phoneOfParents: { type: String , required: true },
  address: { type: String },
  dateOfBirth: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female"] },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdFrom: {type: String,enum: ["excel", "manual"],default: "manual"},
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
