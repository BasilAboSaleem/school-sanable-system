const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["super-admin", "school-admin", "teacher"], default: "school-admin" },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  phone: { type: String },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], // الفصول المرتبطة بالمعلم
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }], // المواد المرتبطة بالمعلم
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User", userSchema);
