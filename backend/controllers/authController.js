require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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