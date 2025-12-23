const express = require("express");
const router = express.Router();
const schoolAdminController = require("../controllers/schoolAdmin");

// Routes for Class Management
router.get("/classes/create", schoolAdminController.renderCreateClassForm);
router.post("/classes/create", schoolAdminController.createClass);
router.get("/classes", schoolAdminController.listClasses);
router.get("/classes/:id/edit", schoolAdminController.renderEditClassForm);
router.post("/classes/:id/edit", schoolAdminController.updateClass);



// Routes for Section Management
router.get("/sections/create", schoolAdminController.renderCreateSectionForm);
router.post("/sections/create", schoolAdminController.createSection);
router.get("/classes/:classId/sections", schoolAdminController.listSectionsByClass);
module.exports = router; 