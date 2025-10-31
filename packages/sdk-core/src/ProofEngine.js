const crypto = require('crypto');
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

class ProofEngine {
  constructor() {
    this.buildDir = path.join(__dirname, '../build');
    this.wasmPath = path.join(this.buildDir, 'rollup_js', 'rollup.wasm');
    this.zkeyPath = path.join(this.buildDir, 'rollup_final.zkey');
    this.vkeyPath = path.join(this.buildDir, 'verification_key.json');
  }

  /**
   * Check if circuit artifacts are available
   */
  isSetupComplete() {
    return fs.existsSync(this.wasmPath) && 
           fs.existsSync(this.zkeyPath) && 
           fs.existsSync(this.vkeyPath);
  }

  /**
   * Generate a real Groth16 ZK proof using snarkjs
   */
  async generateGroth16Proof(batch) {
    if (!this.isSetupComplete()) {
      console.error('❌ Circuit not set up. Run: node packages/sdk-core/scripts/setup-circuit.js');
      throw new Error('Circuit artifacts not found. Please run setup-circuit.js first.');
    }

    // Prepare circuit inputs
    const inputs = this.prepareCircuitInputs(batch);

    // Generate proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      this.wasmPath,
      this.zkeyPath
    );

    // Generate proof hash for tracking
    const proofHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(proof))
      .digest('hex');

    return {
      hash: proofHash,
      proof: proof,
      publicSignals: publicSignals,
      type: 'groth16',
      valid: true,
      batchId: batch.id,
      timestamp: Date.now()
    };
  }

  /**
   * Verify a Groth16 proof using snarkjs
   */
  async verifyGroth16Proof(proofData) {
    if (!this.isSetupComplete()) {
      throw new Error('Circuit artifacts not found. Please run setup-circuit.js first.');
    }

    // Load verification key
    const vKey = JSON.parse(fs.readFileSync(this.vkeyPath, 'utf8'));

    // Verify proof
    const isValid = await snarkjs.groth16.verify(
      vKey,
      proofData.publicSignals,
      proofData.proof
    );

    return isValid;
  }

  /**
   * Prepare inputs for the circuit from batch data
   */
  prepareCircuitInputs(batch) {
    // Convert batch data to circuit inputs
    // Hash transaction data into field elements
    const txHashes = [];
    let txHashSum = BigInt(0);
    
    for (let i = 0; i < 8; i++) {
      if (i < batch.txCount && batch.transactions && batch.transactions[i]) {
        const tx = batch.transactions[i];
        // Simple hash of transaction (in production, use proper hashing)
        const txHash = BigInt('0x' + crypto.createHash('sha256')
          .update(JSON.stringify(tx))
          .digest('hex').substring(0, 16));
        txHashes.push(txHash.toString());
        txHashSum += txHash;
      } else {
        // Pad with zeros
        txHashes.push('0');
      }
    }

    // Convert state roots to field elements (no truncation - use full values)
    // Circuit constraint: newStateRoot === oldStateRoot + txHashSum
    const oldStateRoot = BigInt(batch.oldStateRoot || '0');
    
    console.log(`[ProofEngine] Input oldStateRoot: ${batch.oldStateRoot}`);
    console.log(`[ProofEngine] Parsed oldStateRoot: ${oldStateRoot}`);
    console.log(`[ProofEngine] txHashSum: ${txHashSum}`);
    
    // Calculate newStateRoot to satisfy the constraint
    let newStateRoot;
    if (batch.newStateRoot || batch.stateRoot) {
      // If provided, use it (might fail verification if incorrect)
      newStateRoot = BigInt(batch.newStateRoot || batch.stateRoot || '0');
    } else {
      // Calculate correct newStateRoot: oldStateRoot + txHashSum
      newStateRoot = oldStateRoot + txHashSum;
    }
    
    console.log(`[ProofEngine] Calculated newStateRoot: ${newStateRoot}`);

    return {
      oldStateRoot: oldStateRoot.toString(),
      newStateRoot: newStateRoot.toString(),
      txCount: batch.txCount.toString(),
      txHashes: txHashes
    };
  }

}

module.exports = ProofEngine;
