const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class RollupDatabase {
  constructor(dbPath = './data/rollup.db') {
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initSchema();
  }

  initSchema() {
    // Transactions table (tx pool)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        tx_hash TEXT PRIMARY KEY,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        value TEXT NOT NULL,
        data TEXT,
        nonce INTEGER,
        status TEXT DEFAULT 'pending', -- pending, batched, confirmed
        batch_id INTEGER,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
      )
    `);

    // Batches table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS batches (
        batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
        old_state_root TEXT NOT NULL,
        new_state_root TEXT NOT NULL,
        tx_count INTEGER NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, proving, proven, submitted, confirmed
        proof_hash TEXT,
        l1_tx_hash TEXT,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Proofs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS proofs (
        proof_id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        proof_type TEXT NOT NULL, -- groth16, mock
        proof_data TEXT NOT NULL,
        public_signals TEXT NOT NULL,
        proof_hash TEXT NOT NULL,
        generation_time_ms INTEGER,
        verified INTEGER DEFAULT 0,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
      )
    `);

    // State roots table (history)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS state_roots (
        state_root TEXT PRIMARY KEY,
        batch_id INTEGER,
        height INTEGER NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
      )
    `);

    // Accounts table (L2 state)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        address TEXT PRIMARY KEY,
        balance TEXT DEFAULT '0',
        nonce INTEGER DEFAULT 0,
        last_updated INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Config table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_tx_batch ON transactions(batch_id);
      CREATE INDEX IF NOT EXISTS idx_batch_status ON batches(status);
      CREATE INDEX IF NOT EXISTS idx_proof_batch ON proofs(batch_id);
    `);
  }

  // ========== Transaction Pool Methods ==========

  addTransaction(tx) {
    const stmt = this.db.prepare(`
      INSERT INTO transactions (tx_hash, from_address, to_address, value, data, nonce)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(tx.hash, tx.from, tx.to, tx.value, tx.data || '', tx.nonce);
  }

  getPendingTransactions(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM transactions 
      WHERE status = 'pending' 
      ORDER BY timestamp ASC 
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  markTransactionsBatched(txHashes, batchId) {
    const stmt = this.db.prepare(`
      UPDATE transactions 
      SET status = 'batched', batch_id = ? 
      WHERE tx_hash = ?
    `);
    const updateMany = this.db.transaction((hashes) => {
      for (const hash of hashes) {
        stmt.run(batchId, hash);
      }
    });
    return updateMany(txHashes);
  }

  // ========== Batch Methods ==========

  createBatch(batch) {
    const stmt = this.db.prepare(`
      INSERT INTO batches (old_state_root, new_state_root, tx_count)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(batch.oldStateRoot, batch.newStateRoot, batch.txCount);
    return result.lastInsertRowid;
  }

  updateBatchStatus(batchId, status, updates = {}) {
    let sql = `UPDATE batches SET status = ?`;
    const params = [status];

    if (updates.proofHash) {
      sql += `, proof_hash = ?`;
      params.push(updates.proofHash);
    }
    if (updates.l1TxHash) {
      sql += `, l1_tx_hash = ?`;
      params.push(updates.l1TxHash);
    }

    sql += ` WHERE batch_id = ?`;
    params.push(batchId);

    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  getBatch(batchId) {
    const stmt = this.db.prepare(`SELECT * FROM batches WHERE batch_id = ?`);
    return stmt.get(batchId);
  }

  getAllBatches(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM batches 
      ORDER BY batch_id DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  getLatestBatch() {
    const stmt = this.db.prepare(`
      SELECT * FROM batches 
      ORDER BY batch_id DESC 
      LIMIT 1
    `);
    return stmt.get();
  }

  // ========== Proof Methods ==========

  saveProof(proof) {
    const stmt = this.db.prepare(`
      INSERT INTO proofs (batch_id, proof_type, proof_data, public_signals, proof_hash, generation_time_ms, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      proof.batchId,
      proof.type,
      JSON.stringify(proof.proof),
      JSON.stringify(proof.publicSignals),
      proof.hash,
      proof.generationTimeMs || 0,
      proof.verified ? 1 : 0
    );
  }

  getProofByBatch(batchId) {
    const stmt = this.db.prepare(`SELECT * FROM proofs WHERE batch_id = ?`);
    const result = stmt.get(batchId);
    if (result) {
      result.proof_data = JSON.parse(result.proof_data);
      result.public_signals = JSON.parse(result.public_signals);
    }
    return result;
  }

  // ========== State Root Methods ==========

  saveStateRoot(stateRoot, batchId, height) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO state_roots (state_root, batch_id, height)
      VALUES (?, ?, ?)
    `);
    return stmt.run(stateRoot, batchId, height);
  }

  getCurrentStateRoot() {
    const stmt = this.db.prepare(`
      SELECT state_root FROM state_roots 
      ORDER BY height DESC 
      LIMIT 1
    `);
    const result = stmt.get();
    return result ? result.state_root : null;
  }

  // ========== Account Methods ==========

  getAccount(address) {
    const stmt = this.db.prepare(`SELECT * FROM accounts WHERE address = ?`);
    return stmt.get(address);
  }

  updateAccount(address, balance, nonce) {
    const stmt = this.db.prepare(`
      INSERT INTO accounts (address, balance, nonce)
      VALUES (?, ?, ?)
      ON CONFLICT(address) DO UPDATE SET
        balance = excluded.balance,
        nonce = excluded.nonce,
        last_updated = strftime('%s', 'now')
    `);
    return stmt.run(address, balance.toString(), nonce);
  }

  // ========== Stats Methods ==========

  getStats() {
    const totalTxs = this.db.prepare(`SELECT COUNT(*) as count FROM transactions`).get().count;
    const pendingTxs = this.db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'`).get().count;
    const totalBatches = this.db.prepare(`SELECT COUNT(*) as count FROM batches`).get().count;
    const totalProofs = this.db.prepare(`SELECT COUNT(*) as count FROM proofs`).get().count;

    return {
      totalTransactions: totalTxs,
      pendingTransactions: pendingTxs,
      totalBatches: totalBatches,
      totalProofs: totalProofs
    };
  }

  // ========== Config Methods ==========

  setConfig(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value) 
      VALUES (?, ?)
    `);
    return stmt.run(key, value);
  }

  getConfig(key, defaultValue = null) {
    const stmt = this.db.prepare(`SELECT value FROM config WHERE key = ?`);
    const result = stmt.get(key);
    return result ? result.value : defaultValue;
  }

  close() {
    this.db.close();
  }
}

module.exports = RollupDatabase;
