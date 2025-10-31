const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * L1 Integration - Submit proofs to Sepolia
 */
class L1Integration {
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || process.env.SEPOLIA_RPC_URL;
    this.anchorAddress = config.anchorAddress || process.env.ANCHOR_ADDRESS;
    this.verifierAddress = config.verifierAddress || process.env.VERIFIER_ADDRESS;
    this.privateKey = config.privateKey || process.env.PRIVATE_KEY;

    if (!this.rpcUrl) {
      throw new Error('SEPOLIA_RPC_URL is not set. Please provide it in config or .env file.');
    }
    if (!this.anchorAddress) {
      throw new Error('ANCHOR_ADDRESS is not set. Please provide it in config or .env file.');
    }
    
    // Load ABI
    const abiPath = path.join(__dirname, '../../../abi/ZeroSyncAnchor.json');
    this.anchorAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    
    if (this.privateKey) {
      this.signer = new ethers.Wallet(this.privateKey, this.provider);
      this.contract = new ethers.Contract(this.anchorAddress, this.anchorAbi, this.signer);
    } else {
      // Read-only mode
      this.contract = new ethers.Contract(this.anchorAddress, this.anchorAbi, this.provider);
    }
    
    console.log(`📡 L1 Integration initialized`);
    console.log(`   Anchor: ${this.anchorAddress}`);
    console.log(`   Verifier: ${this.verifierAddress}`);
    console.log(`   Mode: ${this.privateKey ? 'Read/Write' : 'Read-Only'}`);
  }

  /**
   * Submit proof to L1 (Sepolia)
   */
  async submitProof(proof, publicSignals) {
    if (!this.signer) {
      throw new Error('Private key required to submit proofs. Set PRIVATE_KEY in .env');
    }

    try {
      console.log('📤 Submitting proof to Sepolia...');
      
      // Convert proof to contract format
      const a = [proof.pi_a[0], proof.pi_a[1]];
      const b = [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]];
      const c = [proof.pi_c[0], proof.pi_c[1]];
      
      // Ensure publicSignals has exactly 3 elements: [oldRoot, newRoot, txCount]
      const signals = publicSignals.slice(0, 3);
      console.log(`   Public signals: [${signals.join(', ')}]`);
      console.log(`   Proof format: a[${a.length}], b[${b.length}][${b[0].length}], c[${c.length}]`);
      
      // Submit to contract
      const tx = await this.contract.submitProof(a, b, c, signals);
      console.log(`   TX sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      // Get batch ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'ProofSubmitted';
        } catch {
          return false;
        }
      });
      
      let batchId = null;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        batchId = parsed.args.batchId.toString();
        console.log(`   Batch ID: ${batchId}`);
      }
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        batchId,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`
      };
      
    } catch (error) {
      console.error('❌ Failed to submit proof:', error.message);
      throw error;
    }
  }


  /**
   * Get batch from L1
   */
  async getBatch(batchId) {
    try {
      const batch = await this.contract.getBatch(batchId);
      
      return {
        batchId: batch.batchId.toString(),
        oldRoot: batch.oldRoot.toString(),
        newRoot: batch.newRoot.toString(),
        batchHash: batch.batchHash.toString(),
        timestamp: batch.timestamp.toString(),
        txHash: batch.txHash,
        submitter: batch.submitter,
        verified: batch.verified
      };
      
    } catch (error) {
      console.error(`❌ Failed to get batch ${batchId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get latest batches from L1
   */
  async getLatestBatches(count = 10) {
    try {
      const batches = await this.contract.getLatestBatches(count);
      
      return batches.map(batch => ({
        batchId: batch.batchId.toString(),
        oldRoot: batch.oldRoot.toString(),
        newRoot: batch.newRoot.toString(),
        batchHash: batch.batchHash.toString(),
        timestamp: batch.timestamp.toString(),
        verified: batch.verified
      }));
      
    } catch (error) {
      console.error('❌ Failed to get batches:', error.message);
      throw error;
    }
  }

  /**
   * Get current state root from L1
   */
  async getCurrentRoot() {
    try {
      const root = await this.contract.latestRoot();
      return root.toString();
    } catch (error) {
      console.error('❌ Failed to get current root:', error.message);
      throw error;
    }
  }

  /**
   * Get batch count from L1
   */
  async getBatchCount() {
    try {
      const count = await this.contract.batchCount();
      return count.toString();
    } catch (error) {
      console.error('❌ Failed to get batch count:', error.message);
      throw error;
    }
  }

  /**
   * Check if contract is paused
   */
  async isPaused() {
    try {
      return await this.contract.paused();
    } catch (error) {
      console.error('❌ Failed to check paused status:', error.message);
      throw error;
    }
  }
}

module.exports = L1Integration;
