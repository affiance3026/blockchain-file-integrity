require("dotenv").config();
const { ethers } = require("ethers");

// Provider (Sepolia)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract Address
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI
const abi = require("../../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;

// Contract instance
const contract = new ethers.Contract(contractAddress, abi, wallet);

module.exports = contract;