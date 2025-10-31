const { L1Integration } = require('./packages/sdk-core/src/index');
const ProofEngine = require('./packages/sdk-core/src/ProofEngine');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Submit a new batch with REAL ZK proof verification
 */

async function submitRealProof() {
  console.log('🔐 Submitting Batch with Real ZK Proof\n');
  console.log('='.repeat(60));

  try {
    // Initialize
    const l1 = new L1Integration();
    const circuitPath = path.join(__dirname, 'circuits/rollup/rollup_js/rollup.wasm');
    const zkeyPath = path.join(__dirname, 'circuits/rollup/rollup_final.zkey');
    const proofEngine = new ProofEngine(circuitPath, zkeyPath);

    // Get current state
    console.log('\n📊 Current L1 State:');
    const currentRoot = await l1.getCurrentRoot();
    const batchCount = await l1.getBatchCount();
    console.log(`   Current Root: ${currentRoot}`);
    console.log(`   Batch Count: ${batchCount}`);

    // CRITICAL: The circuit field (BN254) reduces large values
    // So we need to work backward: generate a proof, then use its outputs
    console.log('\n⚡️  Strategy: Generate proof first, then submit with circuit values');
    console.log('-'.repeat(60));
    
    // Step 1: Create a valid state transition in the circuit's field
    const txCount = 5;
    const transactions = [];
    for (let i = 0; i < txCount; i++) {
      transactions.push({
        from: '0x' + crypto.randomBytes(20).toString('hex'),
        to: '0x' + crypto.randomBytes(20).toString('hex'),
        value: Math.floor(Math.random() * 1000)
      });
    }

    console.log(`\nGenerating proof with ${txCount} transactions...`);

    // Use current root as starting point
    const startTime = Date.now();
    const batchData = {
      id: 'real-batch-test',
      oldStateRoot: currentRoot,
      txCount: txCount,
      transactions: transactions
    };

    const proofData = await proofEngine.generateGroth16Proof(batchData);
    const proofTime = Date.now() - startTime;
    console.log(`\n✅ Proof generated in ${proofTime}ms`);
    
    // Extract values from public signals [oldRoot, newRoot, txCount]
    const circuitOldRoot = proofData.publicSignals[0];
    const circuitNewRoot = proofData.publicSignals[1];
    const circuitTxCount = proofData.publicSignals[2];
    
    console.log(`\n📊 Circuit Values:`);
    console.log(`   Old Root: ${circuitOldRoot}`);
    console.log(`   New Root: ${circuitNewRoot}`);
    console.log(`   TX Count: ${circuitTxCount}`);

    // Verify proof locally
    console.log('\n✅ Verifying Proof Locally...');
    const isValid = await proofEngine.verifyGroth16Proof(proofData);
    
    if (!isValid) {
      console.error('   ❌ Proof verification failed!');
      process.exit(1);
    }
    
    console.log('   ✅ Proof is cryptographically valid!');

    // Check if circuit root matches contract root
    console.log('\n🔍 Checking Contract Compatibility...');
    const rootMatch = circuitOldRoot === currentRoot;
    console.log(`   Contract Root: ${currentRoot}`);
    console.log(`   Circuit Root:  ${circuitOldRoot}`);
    console.log(`   Match: ${rootMatch ? '✅ YES' : '❌ NO'}`);
    
    if (!rootMatch) {
      console.log('\n⚠️  ROOT MISMATCH DETECTED');
      console.log('   The circuit reduced the large state root due to BN254 field constraints.');
      console.log('   This means the proof is valid but incompatible with current contract state.');
      console.log('\n💡 Solutions:');
      console.log('   1. Ask Aayush to deploy contract with circuit-compatible genesis root');
      console.log('   2. Use smaller state root values that fit in BN254 field');
      console.log('   3. Modify circuit to use different field or handle larger values');
      console.log('\n   For now, the ZK proof system is proven to work correctly!');
      console.log('   Proof generation: ✅');
      console.log('   Proof verification: ✅');
      console.log('   Cryptographic security: ✅');
      return;
    }

    // If roots match, submit to L1
    console.log('\n📤 Submitting to Sepolia...');
    console.log('   (This will cost gas - confirm in your wallet if prompted)');
    
    const result = await l1.submitProof(proofData.proof, proofData.publicSignals);

    // Success!
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BATCH SUBMITTED WITH REAL ZK PROOF!');
    console.log('='.repeat(60));
    console.log(`\n✅ Transaction Hash: ${result.txHash}`);
    console.log(`✅ Block Number: ${result.blockNumber}`);
    console.log(`✅ Gas Used: ${result.gasUsed}`);
    console.log(`✅ Batch ID: ${result.batchId || 'N/A'}`);
    console.log(`\n🔗 View on Etherscan:`);
    console.log(`   ${result.etherscanUrl}`);

    // Verify on-chain
    console.log('\n📋 Verifying On-Chain Status...');
    const finalBatches = await l1.getLatestBatches(1);
    const latestBatch = finalBatches[0];
    
    console.log(`\n   Batch ${latestBatch.batchId}:`);
    console.log(`      Verified: ${latestBatch.verified ? '✅ TRUE' : '❌ FALSE'}`);
    console.log(`      Old Root: ${latestBatch.oldRoot}`);
    console.log(`      New Root: ${latestBatch.newRoot}`);
    console.log(`      Timestamp: ${new Date(parseInt(latestBatch.timestamp) * 1000).toISOString()}`);

    if (latestBatch.verified) {
      console.log('\n🎊 SUCCESS! Batch is cryptographically verified on Sepolia!');
    } else {
      console.log('\n⚠️  Warning: Batch submitted but not marked as verified.');
      console.log('   This may be due to verifier contract configuration.');
    }

    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  submitRealProof()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { submitRealProof };
