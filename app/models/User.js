const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: [
      "super-admin",
      "school-admin",
      "school-coordinator",
      "teacher",
      "attendance",
      "parent"
    ],
    default: "school-admin"
  },

  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "School" 
  },

  phone: { type: String },

  // Teacher only (legacy-safe)
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
