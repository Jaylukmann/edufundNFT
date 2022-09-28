const hre = require("hardhat");
//const artifacts = require("./artifacts");
async function main() {
  const EduFundNFT = await hre.ethers.getContractFactory("EduFundNFT");
  const eduFundNFT = await EduFundNFT.deploy();

  await eduFundNFT.deployed();
  console.log("EduFundNFT deployed to:", eduFundNFT.address);
  storeContractData(eduFundNFT);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/EduFundNFT-address.json",
    JSON.stringify({ EduFundNFT: contract.address }, undefined, 2)
  );

  const EduFundNFTArtifact = artifacts.readArtifactSync("EduFundNFT");

  fs.writeFileSync(
    contractsDir + "/EduFundNFT.json",
    JSON.stringify(EduFundNFTArtifact, null, 2)
  );
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  
 // EduFundNFT deployed to: 0x4c3964D6BB3a6eFD8F2CBD04766990e1Da3368bf
 