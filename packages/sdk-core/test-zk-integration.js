const { ProofEngine } = require('./src/index.js');

async function testZKIntegration() {
  console.log('🧪 Testing Real Zero-Knowledge Proof Integration...\n');

  try {
    // Initialize ProofEngine in groth16 mode
    const engine = new ProofEngine();
    console.log('🔧 ProofEngine initialized');

    // Create mock batch data
    const mockBatch = {
      id: 'test-batch-zk',
      transactions: [
        { from: '0x123', to: '0x456', value: 100, data: '0x' },
        { from: '0x789', to: '0xabc', value: 200, data: '0x' },
        { from: '0xdef', to: '0xghi', value: 150, data: '0x' }
      ],
      stateRoot: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      txCount: 3,
      timestamp: Date.now()
    };

    console.log('📦 Mock batch created:', mockBatch.id);

    // Generate real ZK proof
    console.log('⏳ Generating Groth16 proof...');
    const startTime = Date.now();
    const proofResult = await engine.generateGroth16Proof(mockBatch);
    const endTime = Date.now();

    console.log(`✅ Proof generated in ${endTime - startTime}ms`);
    console.log('📄 Proof type:', proofResult.type);
    console.log('🔍 Valid:', proofResult.valid);
    console.log('🔗 Hash:', proofResult.hash.substring(0, 16) + '...');

    // Verify the proof
    console.log('🔐 Verifying proof...');
    const isValid = await engine.verifyGroth16Proof(proofResult);
    console.log('✅ Verification result:', isValid);

    if (isValid) {
      console.log('\n🎉 SUCCESS: Real ZK proofs are working!');
      console.log('🚀 Ready for production deployment');
    } else {
      console.log('\n❌ FAILED: Proof verification failed');
      return false;
    }

    return true;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('• Check if snarkjs dependencies are installed');
    console.log('• Verify circuits/verification_key.json exists');
    console.log('• Ensure __proto__ fields are correct in inputs');

    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testZKIntegration();
}

module.exports = { testZKIntegration };