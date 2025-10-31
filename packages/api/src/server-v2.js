const express = require('express');
const { Sequencer } = require('../../sdk-core/src/index');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize sequencer (always uses real ZK proofs)
const sequencer = new Sequencer({
  batchSize: parseInt(process.env.BATCH_SIZE) || 8,
  batchTimeout: parseInt(process.env.BATCH_TIMEOUT) || 10000,
  dbPath: process.env.DB_PATH || './data/rollup.db'
});

// Start sequencer
sequencer.start().catch(err => {
  console.error('Failed to start sequencer:', err);
  process.exit(1);
});

// ========== API ROUTES ==========

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ZeroSync Rollup API',
    version: '0.1.0',
    proofMode: 'zk' // Always real ZK proofs
  });
});

// Get rollup statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = sequencer.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current state
app.get('/api/state', (req, res) => {
  try {
    const state = sequencer.getCurrentState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit transaction
app.post('/api/submit-tx', async (req, res) => {
  try {
    const { from, to, value, data, nonce } = req.body;
    
    if (!from || !to || value === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: from, to, value' 
      });
    }
    
    const tx = await sequencer.addTransaction({
      from,
      to,
      value: parseInt(value),
      data: data || '',
      nonce: nonce || 0
    });
    
    res.json({
      success: true,
      txHash: tx.hash,
      message: 'Transaction added to pool'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending transactions
app.get('/api/txpool', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const pending = sequencer.getPendingTransactions(limit);
    res.json({
      count: pending.length,
      transactions: pending
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all batches
app.get('/api/batches', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const batches = sequencer.getBatches(limit);
    res.json({
      count: batches.length,
      batches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific batch
app.get('/api/batches/:id', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const batch = sequencer.getBatch(batchId);
    
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proof for batch
app.get('/api/proofs/:batchId', (req, res) => {
  try {
    const batchId = parseInt(req.params.batchId);
    const proof = sequencer.getProof(batchId);
    
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }
    
    res.json(proof);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger batch processing
app.post('/api/process-batch', async (req, res) => {
  try {
    const batch = await sequencer.processPendingBatch();
    
    if (!batch) {
      return res.json({ message: 'No pending transactions to process' });
    }
    
    res.json({
      success: true,
      batch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await sequencer.shutdown();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`\n✅ ZeroSync Rollup API Server`);
  console.log(`   Port: ${port}`);
  console.log(`   Proof Mode: Real ZK (Groth16)`);
  console.log(`   Batch Size: ${sequencer.config.batchSize}`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`   GET  /api/stats - Rollup statistics`);
  console.log(`   GET  /api/state - Current state`);
  console.log(`   POST /api/submit-tx - Submit transaction`);
  console.log(`   GET  /api/txpool - Pending transactions`);
  console.log(`   GET  /api/batches - All batches`);
  console.log(`   GET  /api/batches/:id - Get batch`);
  console.log(`   GET  /api/proofs/:batchId - Get proof`);
  console.log(`   POST /api/process-batch - Trigger batch`);
  console.log(`\n🚀 Server ready!\n`);
});
