const User = require("../models/user.model");
const Institute = require("../models/institute.model");
const Verifier = require("../models/verifier.model");
const Certificate = require("../models/certificate.model");
const AccessRequest = require("../models/accessRequest.model");

const generateId = async (type) => {
  let Model;
  let prefix;

  switch (type) {
    case "user":
      Model = User;
      prefix = "USER";
      break;

    case "institute":
      Model = Institute;
      prefix = "INST";
      break;

    case "verifier":
      Model = Verifier;
      prefix = "VERF";
      break;

    case "certificate":
      Model = Certificate;
      prefix = "CERT";
      break;

    case "request":
      Model = AccessRequest;
      prefix = "REQS";
      break;

    default:
      throw new Error("Invalid type for ID generation");
  }

  const count = await Model.countDocuments();

  const nextNumber = String(count + 1).padStart(6, "0");

  return `${prefix}${nextNumber}`;
};

module.exports = generateId;