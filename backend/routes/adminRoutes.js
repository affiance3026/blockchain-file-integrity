const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getPendingInstitutes,
  getApprovedInstitutes,
  approveInstitute,
  rejectInstitute
} = require("../controllers/adminController");


router.get(
  "/pending-institutes",
  authMiddleware,
  adminMiddleware,
  getPendingInstitutes
);

router.get(
  "/approved-institutes",
  authMiddleware,
  adminMiddleware,
  getApprovedInstitutes
);

router.put(
  "/approve/:id",
  authMiddleware,
  adminMiddleware,
  approveInstitute
);

router.put(
  "/reject/:id",
  authMiddleware,
  adminMiddleware,
  rejectInstitute
);
module.exports = router;