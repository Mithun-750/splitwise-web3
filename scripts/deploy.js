const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const token = await ethers.deployContract("Splitwise");
    const contractAddress = await token.getAddress();
    
    console.log("Token address:", contractAddress);

    // Update contract-config.json with new address
    const configPath = path.join(__dirname, '..', 'contract-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.contractAddress = contractAddress;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Updated contract address in contract-config.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });