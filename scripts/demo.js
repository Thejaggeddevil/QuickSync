const hre = require("hardhat");

async function main() {
  console.log("🚀 ZeroSync Full Demo\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Genesis root
  const genesisRoot = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ZeroSync Genesis"));

  // Deploy Verifier
  console.log("📦 Deploying Groth16Verifier...");
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ Verifier:", verifierAddress);

  // Deploy Anchor
  console.log("📦 Deploying ZeroSyncAnchor...");
  const Anchor = await hre.ethers.getContractFactory("ZeroSyncAnchor");
  const anchor = await Anchor.deploy(verifierAddress, genesisRoot);
  await anchor.waitForDeployment();
  const anchorAddress = await anchor.getAddress();
  console.log("✅ Anchor:", anchorAddress);

  // Get initial state
  console.log("\n📊 Initial State:");
  const latestRoot = await anchor.latestRoot();
  const batchCount = await anchor.batchCount();
  console.log("   Latest Root:", latestRoot);
  console.log("   Batch Count:", batchCount.toString());

  // Submit 3 mock batches
  console.log("\n🧪 Submitting 3 Mock Batches...\n");
  
  for (let i = 1; i <= 3; i++) {
    const oldRoot = await anchor.latestRoot();
    const newRoot = hre.ethers.keccak256(
      hre.ethers.solidityPacked(["uint256", "uint256"], [oldRoot, Date.now() + i])
    );
    const batchHash = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes(`batch_${i}_${Date.now()}`)
    );

    const tx = await anchor.submitBatchMock(oldRoot, newRoot, batchHash);
    const receipt = await tx.wait();
    
    console.log(`✅ Batch ${i}:`);
    console.log(`   Tx: ${tx.hash}`);
    console.log(`   Gas: ${receipt.gasUsed.toString()}`);
    console.log(`   New Root: ${newRoot.slice(0, 10)}...`);
  }

  // Get final state
  console.log("\n📊 Final State:");
  const finalRoot = await anchor.latestRoot();
  const finalCount = await anchor.batchCount();
  console.log("   Latest Root:", finalRoot.toString());
  console.log("   Batch Count:", finalCount.toString());

  // Get latest batches
  console.log("\n📋 Latest Batches:");
  const batches = await anchor.getLatestBatches(3);
  batches.forEach((batch, idx) => {
    console.log(`\n   Batch #${batch.batchId.toString()}:`);
    console.log(`   └─ New Root: ${batch.newRoot.toString().slice(0, 20)}...`);
    console.log(`   └─ Timestamp: ${new Date(Number(batch.timestamp) * 1000).toLocaleString()}`);
    console.log(`   └─ Verified: ${batch.verified}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEMO COMPLETE!");
  console.log("=".repeat(60));
  console.log(`
✅ Deployed 2 contracts
✅ Submitted 3 batches
✅ All batches on-chain
✅ State roots updated
✅ Ready for team integration!
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
