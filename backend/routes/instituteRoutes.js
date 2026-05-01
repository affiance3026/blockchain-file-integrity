const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const instituteMiddleware = require("../middleware/instituteMiddleware");

const multer = require("multer");

const {
  raiseApprovalRequest,
  issueCertificate,
  getIssuedCertificates,
  getInstituteProfile,
  checkUserExists
} = require("../controllers/instituteController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, PNG, JPG, DOCX files are allowed"));
    }
  },
});


// Raise approval request
router.put(
  "/raise-approval",
  authMiddleware,
  instituteMiddleware,
  upload.single("file"),
  raiseApprovalRequest
);


// Issue certificate
router.post(
  "/issue-certificate",
  authMiddleware,
  instituteMiddleware,
  upload.single("file"),
  issueCertificate
);


// Issued certificates
router.get(
  "/issued-certificates",
  authMiddleware,
  instituteMiddleware,
  getIssuedCertificates
);


// Profile
router.get(
  "/profile",
  authMiddleware,
  instituteMiddleware,
  getInstituteProfile
);

router.get(
  "/check-user/:user_id",
  authMiddleware,
  instituteMiddleware,
  checkUserExists
);
module.exports = router;