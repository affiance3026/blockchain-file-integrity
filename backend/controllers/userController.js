const User = require("../models/user.model");
const Certificate = require("../models/certificate.model");
const AccessRequest = require("../models/accessRequest.model");
const Verifier = require("../models/verifier.model");

// ================= GET ISSUED DOCUMENTS =================

exports.getIssuedDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({
      user_id: userId
    });

    const Institute = require("../models/institute.model");

    const updatedCertificates = await Promise.all(
      certificates.map(async (certificate) => {
        const institute = await Institute.findOne({
          id: certificate.institute_id
        });

        return {
          ...certificate._doc,
          institute_name: institute?.name || "N/A",
          institute_email: institute?.email || "N/A"
        };
      })
    );

    res.status(200).json({
      message: "Issued documents fetched successfully",
      data: updatedCertificates
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch issued documents"
    });
  }
};


// ================= GET ACCESS REQUESTS =================

exports.getAccessRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await AccessRequest.find({
      user_id: userId
    });
    
    const updatedRequests = await Promise.all(
      requests.map(async (reqItem) => {
        // Fetch verifier
        const verifier = await Verifier.findOne({
          id: reqItem.verifier_id
        });

        // Fetch certificate/document
        const certificate = await Certificate.findOne({
          id: reqItem.certificate_id
        });

        return {
          ...reqItem._doc,

          // Verifier Details
          verifier_name: verifier?.name || "N/A",
          verifier_email: verifier?.email || "N/A",

          // Certificate Details
          file_name: certificate?.file_name || "N/A",
          certificate_id: certificate?.id || "N/A"
        };
      })
    );
    res.status(200).json({
      message: "Access requests fetched successfully",
      data: updatedRequests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch access requests"
    });
  }
};


// ================= APPROVE ACCESS REQUEST =================

exports.approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await AccessRequest.findOne({
      id: requestId
    });

    if (!request) {
      return res.status(404).json({
        message: "Access request not found"
      });
    }

    request.status = "approved";
    await request.save();

    res.status(200).json({
      message: "Access request approved successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to approve access request"
    });
  }
};


// ================= REJECT ACCESS REQUEST =================

exports.rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await AccessRequest.findOne({
      id: requestId
    });

    if (!request) {
      return res.status(404).json({
        message: "Access request not found"
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      message: "Access request rejected successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to reject access request"
    });
  }
};


// ================= GET USER PROFILE =================

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      id: userId
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      data: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch user profile"
    });
  }
};