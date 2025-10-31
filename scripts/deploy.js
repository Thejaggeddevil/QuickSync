const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 ZeroSync Deployment Starting...\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("📍 Network:", network);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Genesis root - MUST be compatible with BN254 field used by ZK circuit
  // BN254 prime: 21888242871839275222246405745257275088548364400416034343698204186575808495617
  // Using a simple value that fits in the field
  const genesisRoot = "1000000000000000000"; // 1 billion (well within BN254 field)
  console.log("🌱 Genesis Root (BN254-compatible):", genesisRoot);

  // Deploy Groth16Verifier
  console.log("\n📦 Deploying Groth16Verifier...");
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ Groth16Verifier deployed to:", verifierAddress);

  // Deploy ZeroSyncAnchor
  console.log("\n📦 Deploying ZeroSyncAnchor...");
  const Anchor = await hre.ethers.getContractFactory("ZeroSyncAnchor");
  const anchor = await Anchor.deploy(verifierAddress, genesisRoot);
  await anchor.waitForDeployment();
  const anchorAddress = await anchor.getAddress();
  console.log("✅ ZeroSyncAnchor deployed to:", anchorAddress);

  // Wait for confirmations on live networks
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await verifier.deploymentTransaction().wait(5);
    await anchor.deploymentTransaction().wait(5);
    console.log("✅ Confirmations received");
  }

  // Save deployment info
  const deploymentInfo = {
    network,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    genesisRoot,
    contracts: {
      verifier: verifierAddress,
      anchor: anchorAddress,
    },
    transactionHashes: {
      verifier: verifier.deploymentTransaction().hash,
      anchor: anchor.deploymentTransaction().hash,
    },
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  // Save ABIs
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir);
  }

  const anchorArtifact = await hre.artifacts.readArtifact("ZeroSyncAnchor");
  const verifierArtifact = await hre.artifacts.readArtifact("Groth16Verifier");

  fs.writeFileSync(
    path.join(abiDir, "ZeroSyncAnchor.json"),
    JSON.stringify(anchorArtifact.abi, null, 2)
  );
  fs.writeFileSync(
    path.join(abiDir, "Groth16Verifier.json"),
    JSON.stringify(verifierArtifact.abi, null, 2)
  );
  console.log("💾 ABIs saved to:", abiDir);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log(`
📋 Contract Addresses:
   Verifier: ${verifierAddress}
   Anchor:   ${anchorAddress}

🔗 Verify on Etherscan (if applicable):
   npx hardhat verify --network ${network} ${verifierAddress}
   npx hardhat verify --network ${network} ${anchorAddress} ${verifierAddress} ${genesisRoot}

🧪 Test interaction:
   npx hardhat run scripts/interact.js --network ${network}
  `);

  return {
    verifier: verifierAddress,
    anchor: anchorAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
