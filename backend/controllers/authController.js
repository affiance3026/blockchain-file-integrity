require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const Institute = require("../models/institute.model");
const Verifier = require("../models/verifier.model");

const generateId = require("../utils/generateId");


// ================= REGISTER =================

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    // ================= VALIDATION START =================

    // NAME validation
    const nameRegex = /^[A-Za-z\s]+$/;

    if (
      !name ||
      name.trim().length < 3 ||
      !nameRegex.test(name)
    ) {
      return res.status(400).json({
        message: "Name must contain only letters and spaces (min 3 characters)"
      });
    }

    // PASSWORD validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    // ================= VALIDATION END =================
    let Model;

    switch (role) {
      case "user":
        Model = User;
        break;

      case "institute":
        Model = Institute;
        break;

      case "verifier":
        Model = Verifier;
        break;

      default:
        return res.status(400).json({
          message: "Invalid role selected"
        });
    }

    // Check existing email
    const existingUser = await Model.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // Generate custom ID
    const customId = await generateId(role);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newData = new Model({
      id: customId,
      name,
      email,
      password: hashedPassword
    });

    await newData.save();

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} registered successfully`,
      id: customId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Registration failed"
    });
  }
};


// ================= LOGIN =================

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ================= ADMIN LOGIN =================

    if (role === "admin") {
      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        const token = jwt.sign(
          {
            role: "admin",
            email
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );

        return res.status(200).json({
          message: "Admin login successful",
          role: "admin",
          token
        });
      }

      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    let Model;

    switch (role) {
      case "user":
        Model = User;
        break;

      case "institute":
        Model = Institute;
        break;

      case "verifier":
        Model = Verifier;
        break;

      default:
        return res.status(400).json({
          message: "Invalid role selected"
        });
    }

    const existingUser = await Model.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        message: `${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} not found`
      });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: existingUser.id,
        role,
        email: existingUser.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} login successful`,
      role,
      token,
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      status: existingUser.status || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed"
    });
  }
};

// ================= UPDATE PASSWORD (ALL ROLES) =================

exports.updatePassword = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    let Model;

    // ROLE → MODEL mapping (your exact system)
    switch (role) {
      case "user":
        Model = User;
        break;
      case "institute":
        Model = Institute;
        break;
      case "verifier":
        Model = Verifier;
        break;
      default:
        return res.status(403).json({
          message: "Invalid role",
        });
    }

    const account = await Model.findOne({ id });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    account.password = hashedPassword;
    await account.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update password",
    });
  }
};

// ================= FORGOT PASSWORD (SEND OTP) =================

exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        message: "Email and role are required"
      });
    }

    let Model;

    switch (role) {
      case "user":
        Model = User;
        break;
      case "institute":
        Model = Institute;
        break;
      case "verifier":
        Model = Verifier;
        break;
      default:
        return res.status(400).json({
          message: "Invalid role"
        });
    }

    const account = await Model.findOne({ email });

    if (!account) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    // 🔥 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏳ Expiry: 5 minutes
    const expiry = Date.now() + 5 * 60 * 1000;

    account.otp = otp;
    account.otpExpires = expiry;

    await account.save();

    
    const sendEmail = require("../utils/sendEmail");

    await sendEmail(
      email,
      "Your OTP for Password Reset",
      `Your OTP is: ${otp}. It will expire in 5 minutes.`
    );

    return res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};


// ================= VERIFY OTP =================

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    let Model;

    switch (role) {
      case "user":
        Model = User;
        break;
      case "institute":
        Model = Institute;
        break;
      case "verifier":
        Model = Verifier;
        break;
      default:
        return res.status(400).json({
          message: "Invalid role"
        });
    }

    const account = await Model.findOne({ email });

    if (!account) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    // ❌ No OTP stored
    if (!account.otp || !account.otpExpires) {
      return res.status(400).json({
        message: "No OTP found"
      });
    }

    // ❌ OTP expired
    if (account.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // ❌ OTP mismatch
    if (account.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    
    account.otpVerified = true;

    await account.save();

    return res.status(200).json({
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "OTP verification failed"
    });
  }
};

// ================= RESET PASSWORD =================

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    let Model;

    switch (role) {
      case "user":
        Model = User;
        break;
      case "institute":
        Model = Institute;
        break;
      case "verifier":
        Model = Verifier;
        break;
      default:
        return res.status(400).json({
          message: "Invalid role"
        });
    }

    const account = await Model.findOne({ email });

    if (!account) {
      return res.status(404).json({
        message: "Account not found"
      });
    }


    if (!account.otpVerified) {
      return res.status(400).json({
        message: "OTP not verified"
      });
    }

    // 🔒 OPTIONAL: add password validation (same as register)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    const bcrypt = require("bcrypt");

    const hashedPassword = await bcrypt.hash(password, 10);

    account.password = hashedPassword;

    // ✅ clear OTP + reset flag
    account.otp = undefined;
    account.otpExpires = undefined;
    account.otpVerified = false;

    await account.save();

    return res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Reset failed"
    });
  }
};