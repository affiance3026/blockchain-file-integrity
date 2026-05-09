const Verifier = require("../models/verifier.model");
const Certificate = require("../models/certificate.model");
const AccessRequest = require("../models/accessRequest.model");
const User = require("../models/user.model");
const contract = require("../config/contract");

const generateId = require("../utils/generateId");
const uploadToIPFS = require("../utils/uploadToIPFS");


// ================= REQUEST ACCESS =================

exports.requestAccess = async (req, res) => {
  try {
    const {
      certificate_id,
      user_id,
      from_time,
      to_time
    } = req.body;
    const verifier_id = req.user.id;
    if (
      !certificate_id ||
      !user_id ||
      !from_time ||
      !to_time
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check certificate exists
    const certificate = await Certificate.findOne({
      id: certificate_id
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found"
      });
    }


    const now = new Date();
    const existingRequest = await AccessRequest.findOne({
      certificate_id,
      verifier_id,
      user_id,
      $or: [
        {
          status: "pending"
        },
        {
          status: "approved",
          from_time: { $lte: now },
          to_time: { $gte: now }
        }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Active or pending access request already exists for this certificate"
      });
    }
    // Generate request ID
    const requestId = await generateId("request");

    const newRequest = new AccessRequest({
      id: requestId,
      certificate_id,
      verifier_id,
      user_id,
      status: "pending",
      from_time,
      to_time
    });

    await newRequest.save();

    res.status(201).json({
      message: "Access request raised successfully",
      requestId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to raise access request"
    });
  }
};


// ================= GET MY REQUESTS =================

exports.getMyRequests = async (req, res) => {
  try {
    const verifierId = req.user.id;

    const requests = await AccessRequest.find({
      verifier_id: verifierId
    });

    const updatedRequests = await Promise.all(
      requests.map(async (reqItem) => {

        // Fetch Certificate
        const certificate = await Certificate.findOne({
          id: reqItem.certificate_id
        });

        // Fetch User
        const user = await User.findOne({
          id: reqItem.user_id
        });

        return {
          ...reqItem._doc,

          // Certificate Details
          file_name: certificate?.file_name || "N/A",

          // User Details
          user_name: user?.name || "N/A",
          user_email: user?.email || "N/A",
        };
      })
    );

    res.status(200).json({
      message: "Verifier requests fetched successfully",
      data: updatedRequests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch verifier requests"
    });
  }
};


// ================= VERIFY BY FILE UPLOAD =================

exports.verifyCertificateByUpload = async (req, res) => {
  try {
    const { certificate_id } = req.body;

    if (!certificate_id) {
      return res.status(400).json({
        message: "certificate_id is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Certificate file is required"
      });
    }

    // Upload submitted file to IPFS
    const uploadedCid = await uploadToIPFS(
      req.file.buffer,
      req.file.originalname
    );

    // Fetch blockchain stored data
    const data = await contract.getCertificate(certificate_id);

    const originalCid = data[1];

    if (uploadedCid === originalCid) {
      return res.status(200).json({
        status: "Certificate is authentic"
      });
    }

    res.status(400).json({
      status: "Certificate tampered"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to verify certificate"
    });
  }
};

// ================= GET VERIFIER PROFILE =================

exports.getVerifierProfile = async (req, res) => {
  try {
    const verifierId = req.user.id;

    const verifier = await Verifier.findOne({
      id: verifierId
    });

    if (!verifier) {
      return res.status(404).json({
        message: "Verifier not found"
      });
    }

    res.status(200).json({
      message: "Verifier profile fetched successfully",
      data: verifier
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch verifier profile"
    });
  }
};

// ================= CHECK CERTIFICATE DETAILS =================

exports.checkCertificateDetails = async (req, res) => {
  try {
    const { certificate_id } = req.params;

    const certificate = await Certificate.findOne({
      id: certificate_id
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found"
      });
    }

    const User = require("../models/user.model");
    const Institute = require("../models/institute.model");

    const user = await User.findOne({
      id: certificate.user_id
    });

    const institute = await Institute.findOne({
      id: certificate.institute_id
    });

    res.status(200).json({
      message: "Certificate found",
      data: {
        certificate_id: certificate.id,
        file_name: certificate.file_name,
        user_name: user?.name || "N/A",
        institute_name: institute?.name || "N/A",
        user_id: certificate.user_id
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch certificate details"
    });
  }
};