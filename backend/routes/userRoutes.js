const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const {
  getIssuedDocuments,
  getAccessRequests,
  approveRequest,
  rejectRequest,
  getUserProfile
} = require("../controllers/userController");


router.get(
  "/issued-documents",
  authMiddleware,
  userMiddleware,
  getIssuedDocuments
);

router.get(
  "/access-requests",
  authMiddleware,
  userMiddleware,
  getAccessRequests
);

router.put(
  "/approve-request/:id",
  authMiddleware,
  userMiddleware,
  approveRequest
);

router.put(
  "/reject-request/:id",
  authMiddleware,
  userMiddleware,
  rejectRequest
);

router.get(
  "/profile",
  authMiddleware,
  userMiddleware,
  getUserProfile
);
module.exports = router;