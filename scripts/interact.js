const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  console.log("🔗 Interacting with ZeroSync on", network, "\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ No deployment found for network:", network);
    console.log("Run: npx hardhat run scripts/deploy.js --network", network);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const { verifier: verifierAddress, anchor: anchorAddress } = deployment.contracts;

  console.log("📋 Contract Addresses:");
  console.log("   Verifier:", verifierAddress);
  console.log("   Anchor:  ", anchorAddress, "\n");

  const [operator] = await hre.ethers.getSigners();
  console.log("👤 Operator:", operator.address, "\n");

  // Get contract instances
  const anchor = await hre.ethers.getContractAt("ZeroSyncAnchor", anchorAddress);

  // Check current state
  console.log("📊 Current State:");
  const latestRoot = await anchor.latestRoot();
  const batchCount = await anchor.batchCount();
  console.log("   Latest Root:", latestRoot);
  console.log("   Batch Count:", batchCount.toString(), "\n");

  // Submit a mock batch
  console.log("🧪 Submitting Mock Batch...");
  
  const oldRoot = latestRoot;
  const newRoot = hre.ethers.keccak256(
    hre.ethers.solidityPacked(["uint256", "uint256"], [oldRoot, Date.now()])
  );
  const batchHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(`batch_${Date.now()}`)
  );

  try {
    const tx = await anchor.submitBatchMock(oldRoot, newRoot, batchHash);
    console.log("   Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("   ✅ Batch submitted successfully!");
    console.log("   Gas used:", receipt.gasUsed.toString());

    // Parse events
    const event = receipt.logs.find(
      (log) => log.topics[0] === hre.ethers.id("ProofSubmitted(uint256,uint256,uint256,uint256,address,uint256)")
    );
    
    if (event) {
      const iface = new hre.ethers.Interface([
        "event ProofSubmitted(uint256 indexed batchId, uint256 oldRoot, uint256 newRoot, uint256 batchHash, address indexed submitter, uint256 timestamp)"
      ]);
      const parsed = iface.parseLog(event);
      console.log("\n📦 Batch Details:");
      console.log("   Batch ID:", parsed.args.batchId.toString());
      console.log("   Old Root:", parsed.args.oldRoot);
      console.log("   New Root:", parsed.args.newRoot);
      console.log("   Batch Hash:", parsed.args.batchHash);
    }

    // Get updated state
    console.log("\n📊 Updated State:");
    const newLatestRoot = await anchor.latestRoot();
    const newBatchCount = await anchor.batchCount();
    console.log("   Latest Root:", newLatestRoot);
    console.log("   Batch Count:", newBatchCount.toString());

    // Get batch details
    const batch = await anchor.getBatch(newBatchCount);
    console.log("\n📋 Batch Record:");
    console.log("   Batch ID:", batch.batchId.toString());
    console.log("   Timestamp:", new Date(Number(batch.timestamp) * 1000).toISOString());
    console.log("   Submitter:", batch.submitter);
    console.log("   Verified:", batch.verified);

  } catch (error) {
    console.error("❌ Error submitting batch:", error.message);
    process.exit(1);
  }

  console.log("\n✅ Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
