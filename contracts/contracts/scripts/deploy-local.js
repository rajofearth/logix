import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const LogixINR = await ethers.getContractFactory('LogixINR');
  const token = await LogixINR.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('LogixINR deployed to:', tokenAddress);

  const Escrow = await ethers.getContractFactory('Escrow');
  const escrow = await Escrow.deploy(tokenAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log('Escrow deployed to:', escrowAddress);

  const signers = await ethers.getSigners();
  const buyer = signers[1];
  const driver = signers[2];

  console.log('Funding Buyer:', buyer.address);
  console.log('Funding Driver:', driver.address);

  await token.batchMint(
    [buyer.address, driver.address],
    [ethers.parseUnits('5000000', 18), ethers.parseUnits('100000', 18)]
  );

  console.log('Minted 5M LINR to Buyer and 100K LINR to Driver');
}

main().catch(console.error);
