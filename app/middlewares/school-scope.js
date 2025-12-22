const Student = require("../models/Student"); 

module.exports = async function (req, res, next) {
  try {
    if (req.user.role === "super-admin") return next();

    const resourceSchoolId = req.body.schoolId || req.params.schoolId || req.body.schoolId;

    if (!resourceSchoolId || resourceSchoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: "Access denied: school scope violation" });
    }

    next();
  } catch (err) {
    console.error("School scope middleware error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
