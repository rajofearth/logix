import pkg from 'hardhat';
const { ethers, network } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const [deployer, buyer, driver] = await ethers.getSigners();
    console.log('Deploying contracts with the account:', deployer.address);
    console.log('Network:', network.name);

    // Deploy LogixINR
    const LogixINR = await ethers.getContractFactory('LogixINR');
    const token = await LogixINR.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log('LogixINR deployed to:', tokenAddress);

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy(tokenAddress);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log('Escrow deployed to:', escrowAddress);

    // Setup initial state (mint tokens)
    console.log('Funding Buyer:', buyer.address);
    console.log('Funding Driver:', driver.address);

    // Mint 5M to Buyer and 100K to Driver
    const mintTx = await token.batchMint(
        [buyer.address, driver.address],
        [ethers.parseUnits('5000000', 18), ethers.parseUnits('100000', 18)]
    );
    await mintTx.wait();
    console.log('Minted tokens to Buyer and Driver');

    // Export deployment info
    const deploymentInfo = {
        network: network.name,
        token: tokenAddress,
        escrow: escrowAddress,
        deployer: deployer.address,
        buyer: buyer.address,
        driver: driver.address,
        timestamp: new Date().toISOString()
    };

    const outputPath = path.join(__dirname, '../../deployments.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
