const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Sequencer, StateManager } = require('@zerosync/sdk-core');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Load config
let config = {};
try {
  const configPath = path.join(process.cwd(), 'zerosync.config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (error) {
  console.warn('Warning: Could not load config, using defaults');
  config = {
    rollup: {
      batchSize: 10,
      blockTime: 2000,
      proofInterval: 5
    }
  };
}

// Initialize sequencer
const sequencer = new Sequencer(config);
const stateManager = new StateManager();

// Auto-batch transactions periodically
let autoBatchInterval = null;
if (config.rollup?.blockTime) {
  autoBatchInterval = setInterval(async () => {
    const pending = sequencer.getPendingTransactions();
    if (pending.length > 0) {
      const batches = await sequencer.processBatch();
      
      // Generate proofs for batches
      for (const batch of batches) {
        await sequencer.generateProof(batch);
      }
    }
  }, config.rollup.blockTime);
}

// Routes

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * Get rollup status
 */
app.get('/api/status', (req, res) => {
  const batches = stateManager.getBatches();
  const proofs = stateManager.getProofs();
  
  res.json({
    status: 'running',
    config: config.rollup,
    stats: {
      totalBatches: batches.length,
      totalProofs: Object.keys(proofs).length,
      pendingTransactions: sequencer.getPendingTransactions().length
    }
  });
});

/**
 * Submit a new transaction
 */
app.post('/api/transactions', (req, res) => {
  try {
    const { from, to, value, data } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing required fields: from, to' });
    }

    const tx = sequencer.addTransaction({ from, to, value, data });
    
    res.json({
      success: true,
      transaction: tx,
      pending: sequencer.getPendingTransactions().length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all batches
 */
app.get('/api/batches', (req, res) => {
  try {
    const batches = stateManager.getBatches();
    res.json({ batches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get batch by ID
 */
app.get('/api/batches/:id', (req, res) => {
  try {
    const batches = stateManager.getBatches();
    const batch = batches.find(b => b.id === req.params.id);
    
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ batch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all proofs
 */
app.get('/api/proofs', (req, res) => {
  try {
    const proofs = stateManager.getProofs();
    res.json({ proofs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get proof by batch ID
 */
app.get('/api/proofs/:batchId', (req, res) => {
  try {
    const proof = stateManager.getProof(req.params.batchId);
    
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }

    res.json({ proof });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manual batch trigger (for testing)
 */
app.post('/api/batch/trigger', async (req, res) => {
  try {
    const batches = await sequencer.processBatch();
    
    // Generate proofs
    for (const batch of batches) {
      await sequencer.generateProof(batch);
    }

    res.json({
      success: true,
      batches: batches.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get metrics
 */
app.get('/api/metrics', (req, res) => {
  try {
    const batches = stateManager.getBatches();
    const proofs = stateManager.getProofs();
    
    const metrics = {
      totalBatches: batches.length,
      totalProofs: Object.keys(proofs).length,
      totalTransactions: batches.reduce((sum, b) => sum + b.txCount, 0),
      pendingTransactions: sequencer.getPendingTransactions().length,
      avgBatchSize: batches.length > 0 
        ? batches.reduce((sum, b) => sum + b.txCount, 0) / batches.length 
        : 0
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ZeroSync API running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   POST /api/transactions`);
  console.log(`   GET  /api/batches`);
  console.log(`   GET  /api/proofs`);
  console.log(`   GET  /api/status`);
  console.log(`   GET  /api/metrics`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  if (autoBatchInterval) {
    clearInterval(autoBatchInterval);
  }
  process.exit(0);
});
