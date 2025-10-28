const fs = require('fs');
const path = require('path');

class StateManager {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.ensureDataDir();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Save batches to JSON file
   */
  saveBatches(batches) {
    const batchesFile = path.join(this.dataDir, 'batches.json');
    let existing = [];

    if (fs.existsSync(batchesFile)) {
      const data = fs.readFileSync(batchesFile, 'utf-8');
      existing = JSON.parse(data);
    }

    existing.push(...batches);
    fs.writeFileSync(batchesFile, JSON.stringify(existing, null, 2));
  }

  /**
   * Get all batches
   */
  getBatches() {
    const batchesFile = path.join(this.dataDir, 'batches.json');
    
    if (!fs.existsSync(batchesFile)) {
      return [];
    }

    const data = fs.readFileSync(batchesFile, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Save proof to file
   */
  saveProof(batchId, proof) {
    const proofsFile = path.join(this.dataDir, 'proofs.json');
    let existing = {};

    if (fs.existsSync(proofsFile)) {
      const data = fs.readFileSync(proofsFile, 'utf-8');
      existing = JSON.parse(data);
    }

    existing[batchId] = proof;
    fs.writeFileSync(proofsFile, JSON.stringify(existing, null, 2));
  }

  /**
   * Get all proofs
   */
  getProofs() {
    const proofsFile = path.join(this.dataDir, 'proofs.json');
    
    if (!fs.existsSync(proofsFile)) {
      return {};
    }

    const data = fs.readFileSync(proofsFile, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Get proof by batch ID
   */
  getProof(batchId) {
    const proofs = this.getProofs();
    return proofs[batchId] || null;
  }

  /**
   * Save metrics
   */
  saveMetrics(metrics) {
    const metricsFile = path.join(this.dataDir, 'metrics.json');
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const metricsFile = path.join(this.dataDir, 'metrics.json');
    
    if (!fs.existsSync(metricsFile)) {
      return {
        totalTransactions: 0,
        totalBatches: 0,
        totalProofs: 0,
        avgBatchTime: 0
      };
    }

    const data = fs.readFileSync(metricsFile, 'utf-8');
    return JSON.parse(data);
  }
}

module.exports = StateManager;
