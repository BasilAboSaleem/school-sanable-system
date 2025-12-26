const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies.token;

    if (!authHeader) {
      return handleUnauthorized(req, res);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id);
    if (!user) return handleUnauthorized(req, res);

    // Super Admin
    if (user.role === "super-admin") {
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "super-admin",
      };
      return next();
    }

    // School Admin
    if (user.role === "school-admin") {
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "school-admin",
        schoolId: user.schoolId,
      };
      return next();
    }
    // Teacher
if (user.role === "teacher") {
  req.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: "teacher",
    schoolId: user.schoolId,
  };
  return next();
}
    // Attendance User
    if (user.role === "attendance") {
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "attendance",
        schoolId: user.schoolId,
      };
      return next();
    }

    // Any other role → unauthorized
    return handleUnauthorized(req, res);
  } catch (err) {
    console.error("Auth middleware error:", err);
    return handleUnauthorized(req, res);
  }
};

function handleUnauthorized(req, res, message = "Unauthorized") {
  const isApi =
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.originalUrl.startsWith("/api");

  if (isApi) {
    return res.status(401).json({ message });
  }

  return res.redirect("/auth/login");
}
