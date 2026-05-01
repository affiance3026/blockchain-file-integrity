const Institute = require("../models/institute.model");


// ================= GET PENDING INSTITUTES =================

exports.getPendingInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({
      status: "pending"
    });

    res.status(200).json({
      message: "Pending institutes fetched successfully",
      data: institutes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch pending institutes"
    });
  }
};


// ================= GET APPROVED INSTITUTES =================

exports.getApprovedInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({
      status: "approved"
    });

    res.status(200).json({
      message: "Approved institutes fetched successfully",
      data: institutes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch approved institutes"
    });
  }
};


// ================= APPROVE INSTITUTE =================

exports.approveInstitute = async (req, res) => {
  try {
    const instituteId = req.params.id;

    const institute = await Institute.findOne({
      id: instituteId
    });

    if (!institute) {
      return res.status(404).json({
        message: "Institute not found"
      });
    }

    institute.status = "approved";
    await institute.save();

    res.status(200).json({
      message: "Institute approved successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to approve institute"
    });
  }
};


// ================= REJECT INSTITUTE =================

exports.rejectInstitute = async (req, res) => {
  try {
    const instituteId = req.params.id;

    const institute = await Institute.findOne({
      id: instituteId
    });

    if (!institute) {
      return res.status(404).json({
        message: "Institute not found"
      });
    }

    institute.status = "rejected";
    await institute.save();

    res.status(200).json({
      message: "Institute rejected successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to reject institute"
    });
  }
};