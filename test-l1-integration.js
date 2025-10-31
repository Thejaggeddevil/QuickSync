const { L1Integration } = require('./packages/sdk-core/src/index');

/**
 * Test L1 Integration (Read-Only)
 * Tests reading from deployed Sepolia contracts
 */

async function testL1Integration() {
  console.log('🧪 Testing L1 Integration (Sepolia)\n');
  console.log('='.repeat(60));

  try {
    // Initialize L1 integration (read-only mode)
    const l1 = new L1Integration();

    // Test 1: Get current state root
    console.log('\n📋 Test 1: Get Current State Root');
    console.log('-'.repeat(60));
    const currentRoot = await l1.getCurrentRoot();
    console.log(`✅ Current Root: ${currentRoot}`);

    // Test 2: Get batch count
    console.log('\n📋 Test 2: Get Batch Count');
    console.log('-'.repeat(60));
    const batchCount = await l1.getBatchCount();
    console.log(`✅ Total Batches: ${batchCount}`);

    // Test 3: Get latest batches (if any)
    if (parseInt(batchCount) > 0) {
      console.log('\n📋 Test 3: Get Latest Batches');
      console.log('-'.repeat(60));
      const batches = await l1.getLatestBatches(5);
      console.log(`✅ Retrieved ${batches.length} batches:\n`);
      
      batches.forEach((batch, idx) => {
        console.log(`   Batch ${batch.batchId}:`);
        console.log(`      Old Root: ${batch.oldRoot}`);
        console.log(`      New Root: ${batch.newRoot}`);
        console.log(`      Verified: ${batch.verified}`);
        console.log(`      Timestamp: ${new Date(parseInt(batch.timestamp) * 1000).toISOString()}`);
        console.log('');
      });
    }

    // Test 4: Check if paused
    console.log('📋 Test 4: Check Contract Status');
    console.log('-'.repeat(60));
    const isPaused = await l1.isPaused();
    console.log(`✅ Contract Paused: ${isPaused}`);

    // Test 5: Contract addresses
    console.log('\n📋 Test 5: Contract Information');
    console.log('-'.repeat(60));
    console.log(`✅ Anchor Address: ${l1.anchorAddress}`);
    console.log(`✅ Verifier Address: ${l1.verifierAddress}`);
    console.log(`✅ Etherscan Anchor: https://sepolia.etherscan.io/address/${l1.anchorAddress}`);
    console.log(`✅ Etherscan Verifier: https://sepolia.etherscan.io/address/${l1.verifierAddress}`);

    // Success
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL L1 INTEGRATION TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ L1 Integration Features Verified:');
    console.log('   • Read current state root from Sepolia');
    console.log('   • Query batch count');
    console.log('   • Fetch batch data');
    console.log('   • Check contract status');
    console.log('   • Contract addresses confirmed');
    console.log('\n🔗 Connected to deployed contracts on Sepolia testnet!');

    if (!process.env.PRIVATE_KEY) {
      console.log('\n💡 Note: Running in read-only mode.');
      console.log('   To submit proofs, add PRIVATE_KEY to .env file.');
    }

    console.log('');
    return true;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check .env file has correct addresses');
    console.log('   • Verify Sepolia RPC URL is working');
    console.log('   • Ensure contracts are deployed');
    
    return false;
  }
}

// Run the test
if (require.main === module) {
  testL1Integration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testL1Integration };
