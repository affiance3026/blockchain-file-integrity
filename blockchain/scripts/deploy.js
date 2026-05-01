const { ethers } = require("hardhat");

async function main() {
  const FileStorage = await ethers.getContractFactory("CertificateRegistry");

  const contract = await FileStorage.deploy();

  
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});