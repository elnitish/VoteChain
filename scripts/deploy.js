let { ethers } = require("hardhat");
let fs = require("fs");
let path = require("path");

async function deploymentScript() {
    let secureVoting = await ethers.getContractFactory("Voting");
    let voting = await secureVoting.deploy();
    // await SecureVoting.deployed();
    let [owner] = await ethers.getSigners();
    console.log("Secure Voting contract deployed by:", owner.address);

    console.log("Secure Voting deployed to:", voting.target);
    const contractsDir = path.resolve(__dirname, '..', 'views', 'contractAddress.json');
    fs.writeFileSync(
        contractsDir,
        JSON.stringify({ Address: voting.target }, null, 2)
    );
}

deploymentScript().catch((error) => {
    console.error("Error in deployment script: ", error);
    process.exitCode = 1;
});