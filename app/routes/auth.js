const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

const authValidator = require("../validators/authValidator");

// Login Route

router.get("/login", authController.getLogin);
router.post("/login", authValidator.validateLogin, authController.postLogin);
router.post('/logout', authController.logout);

module.exports = router;