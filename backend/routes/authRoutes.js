const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");


// Common Register Route
router.post(
  "/register",
  register
);


// Common Login Route
router.post(
  "/login",
  login
);

module.exports = router;