const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  updatePassword
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

//update password
router.put(
  "/update-password",
  authMiddleware,
  updatePassword
);
module.exports = router;