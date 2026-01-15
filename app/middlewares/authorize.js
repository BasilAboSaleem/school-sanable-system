// app/middlewares/authorize.js
module.exports = function authorize(allowedRoles = []) {
  // Ensure allowedRoles is an array
  if (typeof allowedRoles === 'string') {
    allowedRoles = [allowedRoles];
  }

  return (req, res, next) => {
    if (!req.user) {
      // API requests: 401 Unauthorized
      if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api')) {
          return res.status(401).json({ error: "Unauthorized" });
      }
      return res.redirect("/auth/login");
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      // API requests: 403 Forbidden
      if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api')) {
         return res.status(403).json({ error: "Access Denied" });
      }

      return res.status(403).render("errors/403", {
        message: "ليس لديك صلاحية للوصول إلى هذه الصفحة",
      });
    }

    next();
  };
};
