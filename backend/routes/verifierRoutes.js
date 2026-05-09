const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const verifierMiddleware = require("../middleware/verifierMiddleware");
const multer = require("multer");

const {
  requestAccess,
  getMyRequests,
  verifyCertificateByUpload,
  getVerifierProfile,
  checkCertificateDetails
} = require("../controllers/verifierController");

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


router.post(
  "/request-access",
  authMiddleware,
  verifierMiddleware,
  requestAccess
);

router.get(
  "/my-requests",
  authMiddleware,
  verifierMiddleware,
  getMyRequests
);

router.post(
  "/verify-upload",
  authMiddleware,
  verifierMiddleware,
  upload.single("file"),
  verifyCertificateByUpload
);


router.get(
  "/profile",
  authMiddleware,
  verifierMiddleware,
  getVerifierProfile
);


router.get(
  "/check-certificate/:certificate_id",
  authMiddleware,
  verifierMiddleware,
  checkCertificateDetails
);


module.exports = router;