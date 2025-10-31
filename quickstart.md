# ZeroSync - Quick Start (5 Minutes)

## 🚀 Get Running Fast

### Step 1: Install (1 minute)

```bash
# In the zerosync-backend directory
npm install
```

### Step 2: Link CLI (30 seconds)

```bash
npm link packages/cli
```

### Step 3: Create Test Project (30 seconds)

```bash
zerosync init my-test-rollup
cd my-test-rollup
```

### Step 4: Run Simulation (1 minute)

```bash
zerosync simulate --txs 20 --audit
```

You should see:
```
🚀 Starting ZeroSync simulation...

✔ Generated 20 transactions
✔ Created 2 batch(es)
✔ Mock proofs generated

✓ Simulation complete!

Results:
  Transactions: 20
  Batches: 2
  Batch size: 10

📊 Performance Audit:
  L1 Gas Cost: 420,000
  Rollup Gas Cost: 200,000
  Savings: 52.4%
  Avg Finality: 10000ms

💡 Tip: Run "zerosync deploy" to deploy the anchor contract
```

### Step 5: Check Generated Data (30 seconds)

```bash
# Windows
type data\batches.json
type data\proofs.json

# Unix/Mac
cat data/batches.json
cat data/proofs.json
```

### Step 6: Start API Server (1 minute)

```bash
zerosync run --port 3001
```

You should see:
```
🚀 Starting ZeroSync rollup in live mode...

✓ API server running on port 3001

Endpoints:
  POST http://localhost:3001/api/transactions
  GET  http://localhost:3001/api/batches
  GET  http://localhost:3001/api/proofs
  GET  http://localhost:3001/api/status

📊 Dashboard available at:
  http://localhost:3000 (connect to API on port 3001)

💡 Press Ctrl+C to stop the rollup
```

### Step 7: Test API (1 minute)

Open a **new terminal** and run:

```bash
# Test health
curl http://localhost:3001/api/health

# Test status
curl http://localhost:3001/api/status

# Submit a transaction
curl -X POST http://localhost:3001/api/transactions -H "Content-Type: application/json" -d "{\"from\":\"0x1111\",\"to\":\"0x2222\",\"value\":500}"

# Check batches
curl http://localhost:3001/api/batches

# Check metrics
curl http://localhost:3001/api/metrics
```

---

## ✅ Success!

If all commands worked, your backend is **fully functional**! 🎉

### What You Just Did:

1. ✅ Installed all dependencies
2. ✅ Created a CLI tool
3. ✅ Initialized a rollup project
4. ✅ Simulated transaction batching
5. ✅ Generated mock ZK proofs
6. ✅ Calculated gas savings (52%!)
7. ✅ Started a REST API server
8. ✅ Tested all endpoints

---

## 🔥 Demo This to Your Team

Run this sequence:

```bash
# Terminal 1: Start API
cd my-test-rollup
zerosync run --port 3001

# Terminal 2: Submit transactions
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"from":"0xAAA","to":"0xBBB","value":1000}'

curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"from":"0xCCC","to":"0xDDD","value":2000}'

# Wait 2 seconds for auto-batching

# Check results
curl http://localhost:3001/api/batches
curl http://localhost:3001/api/metrics
```

---

## 📊 For Himanshu (Frontend)

Your API is running at: `http://localhost:3001/api`

Key endpoints to integrate:
- `GET /api/status` - Rollup status
- `POST /api/transactions` - Submit new tx
- `GET /api/batches` - Get all batches
- `GET /api/proofs` - Get all proofs
- `GET /api/metrics` - Performance data

Full docs: See `API_REFERENCE.md`

---

## 🔗 For Aayush (Smart Contracts)

Once your Anchor contract is ready:

1. Update `packages/contracts-interface/src/index.js`
2. Replace `ANCHOR_ABI` and `ANCHOR_BYTECODE`
3. Test with: `zerosync deploy --chain sepolia`

---

## 🐛 Troubleshooting

### `zerosync: command not found`
```bash
npm link packages/cli
```

### Module errors
```bash
npm install
```

### Port in use
```bash
zerosync run --port 3002
```

---

## 📚 Learn More

- **Full Docs**: `README.md`
- **Setup Guide**: `SETUP.md`
- **API Reference**: `API_REFERENCE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`

---

**You're ready to build! 🚀**

Next: Coordinate with your team and prepare the demo!
