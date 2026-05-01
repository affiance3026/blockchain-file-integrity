require("dotenv").config();

const FormData = require("form-data");
const axios = require("axios");

const PINATA_JWT = process.env.PINATA_JWT;


const uploadToIPFS = async (fileBuffer, fileName) => {
  try {
    const data = new FormData();

    data.append("file", fileBuffer, fileName);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...data.getHeaders()
        }
      }
    );

    return response.data.IpfsHash;

  } catch (error) {
    console.error("IPFS Upload Error:", error.response?.data || error.message);
    throw new Error("Failed to upload file to IPFS");
  }
};

module.exports = uploadToIPFS;