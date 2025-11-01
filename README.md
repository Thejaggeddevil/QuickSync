
## 🚀 Overview

This monorepo contains:

- **CLI** (`@zerosync/cli`) - Command-line interface for rollup management
- **SDK Core** (`@zerosync/sdk-core`) - Sequencer, Proof Engine, State Manager
- **API** (`@zerosync/api`) - Express REST API for frontend integration
- **Contracts Interface** (`@zerosync/contracts-interface`) - Ethers.js wrapper for Aayush's Anchor contract

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Make CLI globally available (optional)
npm link packages/cli
```

---

## 🎯 Quick Start

### 1. Initialize a New Rollup Project

```bash
zerosync init my-rollup
cd my-rollup
```

This creates:
- `zerosync.config.json` - Rollup configuration
- `.env.example` - Environment template
- `data/` - State storage directory

### 2. Simulate Rollup Locally

```bash
zerosync simulate --txs 20 --audit
```

This will:
- Generate 20 dummy transactions
- Batch them according to config
- Generate mock proofs
- Show performance metrics

### 3. Deploy Anchor Contract

First, set up your environment:

```bash
# Copy .env.example to .env
cp .env.example .env

# Add your private key and RPC URL
# PRIVATE_KEY=0x...
# RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

Then deploy:

```bash
zerosync deploy --chain sepolia
```

### 4. Run Live Rollup

```bash
zerosync run --port 3001
```

The API will start on `http://localhost:3001`

Himanshu can now connect his frontend to these endpoints!

---

## 🔌 API Endpoints (for Himanshu)

### Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | Rollup status & stats |
| POST | `/transactions` | Submit new transaction |
| GET | `/batches` | Get all batches |
| GET | `/batches/:id` | Get specific batch |
| GET | `/proofs` | Get all proofs |
| GET | `/proofs/:batchId` | Get specific proof |
| GET | `/metrics` | Performance metrics |
| POST | `/batch/trigger` | Manually trigger batch (testing) |

### Example: Submit Transaction

```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x1234...",
    "to": "0x5678...",
    "value": 100
  }'
```

---

## 📁 Project Structure

```
zerosync-backend/
├── packages/
│   ├── cli/              # CLI commands (init, simulate, deploy, run)
│   │   ├── bin/
│   │   │   └── zerosync.js
│   │   ├── commands/
│   │   │   ├── init.js
│   │   │   ├── simulate.js
│   │   │   ├── deploy.js
│   │   │   └── run.js
│   │   └── utils/
│   │       └── config.js
│   │
│   ├── sdk-core/         # Core rollup logic
│   │   └── src/
│   │       ├── Sequencer.js      # Batch transactions
│   │       ├── ProofEngine.js    # Generate mock proofs
│   │       ├── StateManager.js   # JSON/SQLite storage
│   │       └── index.js
│   │
│   ├── api/              # Express REST API
│   │   └── src/
│   │       └── server.js
│   │
│   └── contracts-interface/  # Ethers.js integration
│       └── src/
│           └── index.js
│
├── package.json
└── README.md
```

---

## ⚙️ Configuration

### `zerosync.config.json`

```json
{
  "name": "my-rollup",
  "type": "mock-zk",
  "rollup": {
    "batchSize": 10,
    "blockTime": 2000,
    "proofInterval": 5,
    "gasLimit": 8000000
  },
  "chain": {
    "target": "sepolia",
    "rpcUrl": "",
    "anchorAddress": ""
  }
}
```

---

## 🧪 Testing

### Test CLI Commands

```bash
# Test init
zerosync init test-rollup

# Test simulate
cd test-rollup
zerosync simulate --txs 10

# Test API
zerosync run
# In another terminal:
curl http://localhost:3001/api/status
```

---

## 🔗 Integration with Team

### With Aayush (Smart Contracts)

Once Aayush has the Anchor contract ready:

1. Get the compiled contract ABI and bytecode
2. Update `packages/contracts-interface/src/index.js`:
   - Replace `ANCHOR_ABI` with his ABI
   - Replace `ANCHOR_BYTECODE` with his bytecode
3. Test deployment: `zerosync deploy`

### With Himanshu (Frontend)

1. Start the API: `zerosync run --port 3001`
2. He connects to `http://localhost:3001/api`
3. Dashboard can visualize:
   - Real-time transaction flow
   - Batch creation
   - Proof generation
   - Metrics

---

## 📊 Data Storage

State is stored in `data/` directory:

```
data/
├── batches.json   # All batches
├── proofs.json    # All proofs
└── metrics.json   # Performance metrics
```

---

## 🚧 TODO / Future Improvements

- [ ] Add SQLite support (currently JSON only)
- [ ] Real ZK proof integration (Plonky2/Halo2)
- [ ] On-chain proof verification
- [ ] Plugin system for Polygon CDK, zkSync Stack
- [ ] WebSocket support for real-time updates
- [ ] Gas estimation improvements

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **CLI Framework**: Commander.js
- **API Framework**: Express.js
- **Blockchain**: Ethers.js v6
- **State**: JSON (upgradeable to SQLite)

---

## 🐛 Troubleshooting

### CLI not found

```bash
npm link packages/cli
```

### Module resolution errors

```bash
npm install
# Or reinstall specific package
cd packages/sdk-core && npm install
```

### Port already in use

```bash
zerosync run --port 3002
```

---

## 📝 Notes for Demo

**Judge-Friendly Talking Points:**

1. **One command setup**: `zerosync init` → instant rollup
2. **Visual simulation**: `zerosync simulate --audit` shows gas savings
3. **Production-ready API**: REST endpoints for any frontend
4. **Extensible**: Plugin architecture for real ZK backends

---


