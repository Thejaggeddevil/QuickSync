const { L1Integration } = require('./packages/sdk-core/src/index');
const { ProofEngine } = require('./packages/proof-engine/src/ProofEngine');
const path = require('path');
require('dotenv').config();

/**
 * Verify existing batches by submitting real ZK proofs
 */

async function verifyBatches() {
  console.log('🔐 Verifying Batches with Real ZK Proofs\n');
  console.log('='.repeat(60));

  try {
    // Initialize L1 integration
    const l1 = new L1Integration();
    
    // Initialize proof engine
    const circuitPath = path.join(__dirname, 'circuits/rollup/rollup_js/rollup.wasm');
    const zkeyPath = path.join(__dirname, 'circuits/rollup/rollup_final.zkey');
    const proofEngine = new ProofEngine(circuitPath, zkeyPath);

    // Get existing batches
    console.log('\n📋 Fetching existing batches...');
    const batches = await l1.getLatestBatches(5);
    console.log(`Found ${batches.length} batches\n`);

    // Filter unverified batches
    const unverifiedBatches = batches.filter(b => !b.verified);
    console.log(`Unverified batches: ${unverifiedBatches.length}`);

    if (unverifiedBatches.length === 0) {
      console.log('\n✅ All batches already verified!');
      return;
    }

    // Verify each batch
    for (const batch of unverifiedBatches) {
      console.log('\n' + '-'.repeat(60));
      console.log(`\n🔍 Verifying Batch ${batch.batchId}`);
      console.log(`   Old Root: ${batch.oldRoot}`);
      console.log(`   New Root: ${batch.newRoot}`);

      try {
        // Generate proof for this batch
        console.log('\n⚙️  Generating ZK proof...');
        
        const input = {
          oldRoot: BigInt(batch.oldRoot),
          newRoot: BigInt(batch.newRoot),
          txCount: 1n, // Mock transaction count
          batchHash: BigInt(batch.batchHash)
        };

        const { proof, publicSignals } = await proofEngine.generateProof(input);
        console.log('   ✅ Proof generated');

        // Verify proof locally first
        const isValid = await proofEngine.verifyProof(proof, publicSignals);
        
        if (!isValid) {
          console.log('   ❌ Proof verification failed locally - skipping');
          continue;
        }

        console.log('   ✅ Proof verified locally');

        // Submit proof to L1
        console.log('\n📤 Submitting proof to Sepolia...');
        const result = await l1.submitProof(proof, publicSignals);

        if (result.success) {
          console.log(`\n🎉 Batch ${batch.batchId} verified on-chain!`);
          console.log(`   Transaction: ${result.etherscanUrl}`);
          console.log(`   Gas used: ${result.gasUsed}`);
        }

      } catch (error) {
        console.error(`\n❌ Failed to verify batch ${batch.batchId}:`, error.message);
      }
    }

    // Final status check
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Final Status:');
    const finalBatches = await l1.getLatestBatches(5);
    const verifiedCount = finalBatches.filter(b => b.verified).length;
    console.log(`   Total Batches: ${finalBatches.length}`);
    console.log(`   Verified: ${verifiedCount}`);
    console.log(`   Pending: ${finalBatches.length - verifiedCount}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyBatches()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifyBatches };
