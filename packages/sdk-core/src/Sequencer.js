const crypto = require('crypto');
const ProofEngine = require('./ProofEngine');
const StateManager = require('./StateManager');

class Sequencer {
  constructor(config) {
    this.config = config;
    this.proofEngine = new ProofEngine();
    this.stateManager = new StateManager();
    this.pendingTransactions = [];
    this.batches = [];
  }

  /**
   * Add a transaction to the pending pool
   */
  addTransaction(tx) {
    const txWithId = {
      ...tx,
      id: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now()
    };
    this.pendingTransactions.push(txWithId);
    return txWithId;
  }

  /**
   * Process transactions into batches
   */
  async processBatch(transactions = null) {
    const txsToProcess = transactions || this.pendingTransactions;
    const batchSize = this.config.rollup.batchSize;
    const batches = [];

    for (let i = 0; i < txsToProcess.length; i += batchSize) {
      const batchTxs = txsToProcess.slice(i, i + batchSize);
      const batch = {
        id: crypto.randomBytes(16).toString('hex'),
        transactions: batchTxs,
        timestamp: Date.now(),
        txCount: batchTxs.length,
        stateRoot: null,
        proofHash: null
      };

      // Calculate state root (simplified)
      batch.stateRoot = this.calculateStateRoot(batchTxs);
      
      batches.push(batch);
      this.batches.push(batch);
    }

    // Clear pending transactions if we processed them
    if (!transactions) {
      this.pendingTransactions = [];
    }

    // Save to state
    this.stateManager.saveBatches(batches);

    return batches;
  }

  /**
   * Generate proof for a batch
   */
  async generateProof(batch) {
    const proof = await this.proofEngine.generateMockProof(batch);
    batch.proofHash = proof.hash;
    
    // Save proof
    this.stateManager.saveProof(batch.id, proof);
    
    return proof;
  }

  /**
   * Calculate state root from transactions
   */
  calculateStateRoot(transactions) {
    const data = JSON.stringify(transactions);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get all batches
   */
  getBatches() {
    return this.batches;
  }

  /**
   * Get batch by ID
   */
  getBatch(id) {
    return this.batches.find(b => b.id === id);
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions() {
    return this.pendingTransactions;
  }
}

module.exports = Sequencer;
