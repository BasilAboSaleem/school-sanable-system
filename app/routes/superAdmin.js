const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdmin");

router.get("/schools/add", superAdminController.getAddSchool);

module.exports = router;