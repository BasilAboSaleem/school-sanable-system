const express = require("express");
const router = express.Router();
const PearntController = require("../controllers/parent");

router.get("/students", PearntController.getMyStudents);
router.get("/students/:id", PearntController.getStudentDetails);


module.exports = router;