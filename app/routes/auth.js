const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Login Route

router.get("/login", authController.getLogin);
module.exports = router;