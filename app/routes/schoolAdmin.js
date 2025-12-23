const express = require("express");
const router = express.Router();
const schoolAdminController = require("../controllers/schoolAdmin");

router.get("/classes/create", schoolAdminController.renderCreateClassForm);
router.post("/classes/create", schoolAdminController.createClass);
 
module.exports = router;