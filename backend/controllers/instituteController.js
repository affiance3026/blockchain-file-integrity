const Institute = require("../models/institute.model");
const User = require("../models/user.model");
const Certificate = require("../models/certificate.model");

const contract = require("../config/contract");

const generateId = require("../utils/generateId");
const uploadToIPFS = require("../utils/uploadToIPFS");


// ================= RAISE REQUEST FOR APPROVAL =================

exports.raiseApprovalRequest = async (req, res) => {
  try {
    const instituteId = req.user.id;

    const institute = await Institute.findOne({
      id: instituteId,
    });

    if (!institute) {
      return res.status(404).json({
        message: "Institute not found",
      });
    }
    
    if (institute.status === "pending") {
      return res.status(400).json({
        message: "Your request is already raised and in pending",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Verification document is required",
      });
    }

    const cid = await uploadToIPFS(
      req.file.buffer,
      req.file.originalname
    );

    institute.cid = cid;
    institute.status = "pending";

    await institute.save();

    res.status(200).json({
      message: "Approval request raised successfully",
      cid,
      data: institute,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to raise approval request",
    });
  }
};


// ================= ISSUE CERTIFICATE =================

exports.issueCertificate = async (req, res) => {
  try {
    const institute_id = req.user.id;
    const { user_id, file_name } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id is required",
      });
    }

    const institute = await Institute.findOne({
      id: institute_id,
    });

    if (!institute) {
      return res.status(404).json({
        message: "Institute not found",
      });
    }

    if (institute.status !== "approved") {
      return res.status(403).json({
        message: "Institute is not approved yet",
      });
    }

    const user = await User.findOne({
      id: user_id,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Certificate file is required",
      });
    }
    // duplicate certificate
    const existingCertificate = await Certificate.findOne({
      user_id,
      file_name: req.body.file_name,
    });

    if (existingCertificate) {
      return res.status(400).json({
        message: `${file_name || "This certificate"} already issued for this user`
      });
    }
    const cid = await uploadToIPFS(
      req.file.buffer,
      req.file.originalname
    );

    const certificateId = await generateId("certificate");

    const tx = await contract.storeCertificate(
      certificateId,
      cid,
      institute_id,
      user_id
    );

    await tx.wait();

    const newCertificate = new Certificate({
      id: certificateId,
      user_id,
      institute_id,
      file_name: req.body.file_name || req.file.originalname,
      file_url: cid,
    });

    await newCertificate.save();

    res.status(201).json({
      message: "Certificate issued successfully",
      certificateId,
      cid,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to issue certificate",
    });
  }
};


// ================= GET ISSUED CERTIFICATES =================

exports.getIssuedCertificates = async (req, res) => {
  try {
    const instituteId = req.user.id;

    const certificates = await Certificate.find({
      institute_id: instituteId,
    });

    const updatedCertificates = await Promise.all(
      certificates.map(async (cert) => {

        const user = await User.findOne({
          id: cert.user_id
        });

        return {
          ...cert._doc,

          user_name: user?.name || "N/A",
          user_email: user?.email || "N/A",
        };
      })
    );

    res.status(200).json({
      message: "Issued certificates fetched successfully",
      data: updatedCertificates,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch issued certificates",
    });
  }
};


// ================= GET INSTITUTE PROFILE =================

exports.getInstituteProfile = async (req, res) => {
  try {
    const instituteId = req.user.id;

    const institute = await Institute.findOne({
      id: instituteId,
    });

    if (!institute) {
      return res.status(404).json({
        message: "Institute not found",
      });
    }

    res.status(200).json({
      message: "Institute profile fetched successfully",
      data: institute,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch institute profile",
    });
  }
};

// ================= CHECK USER EXISTS =================

exports.checkUserExists = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findOne({
      id: user_id
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User found",
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to verify user"
    });
  }
};