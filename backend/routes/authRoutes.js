const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
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

//forgot password
router.post(
  "/forgot-password", 
  forgotPassword
);

//verify otp
router.post(
  "/verify-otp",
  verifyOtp
);

//reset otp
router.post(
  "/reset-password", 
  resetPassword
);

//update password
router.put(
  "/update-password",
  authMiddleware,
  updatePassword
);
module.exports = router;