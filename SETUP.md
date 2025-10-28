# ZeroSync Backend - Setup Guide

## 🚀 Initial Setup

### 1. Install Dependencies

Open your terminal (PowerShell, CMD, or Git Bash) in the project root:

```bash
npm install
```

This will install all dependencies for all packages using npm workspaces.

### 2. Link CLI Globally (Optional but Recommended)

To use `zerosync` command from anywhere:

```bash
npm link packages/cli
```

Or run directly:

```bash
node packages/cli/bin/zerosync.js
```

---

## ✅ Verify Installation

### Test CLI Help

```bash
zerosync --help
```

You should see:

```
Usage: zerosync [options] [command]

ZeroSync SDK - Build and deploy rollups in minutes

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init <project-name>  Initialize a new ZeroSync rollup project
  simulate             Simulate rollup locally with dummy transactions
  deploy               Deploy Anchor contract to target chain
  run                  Start live rollup mode (sequencer + proof engine)
  help [command]       display help for command
```

---

## 🎯 Quick Demo

### Create a Test Project

```bash
# 1. Initialize
zerosync init demo-rollup
cd demo-rollup

# 2. Simulate
zerosync simulate --txs 15 --audit

# 3. Check the generated data
dir data  # Windows
ls data   # Unix/Mac
```

You should see `batches.json` and `proofs.json` files created!

---

## 🔌 Test API Server

### Start the API

From inside your project directory:

```bash
zerosync run --port 3001
```

### Test Endpoints (in another terminal)

```bash
# Check health
curl http://localhost:3001/api/health

# Check status
curl http://localhost:3001/api/status

# Submit a transaction
curl -X POST http://localhost:3001/api/transactions ^
  -H "Content-Type: application/json" ^
  -d "{\"from\":\"0x1234\",\"to\":\"0x5678\",\"value\":100}"

# Get batches
curl http://localhost:3001/api/batches

# Get metrics
curl http://localhost:3001/api/metrics
```

**Note**: On Windows CMD, use `^` for line continuation. On PowerShell/Bash, use `\`.

---

## 🧪 Development Workflow

### Package Structure

The monorepo uses npm workspaces. Each package is independent:

```
packages/
├── cli/                 - Command-line interface
├── sdk-core/            - Core sequencer logic
├── api/                 - Express REST API
└── contracts-interface/ - Ethers.js wrapper
```

### Make Changes

Edit any file and test immediately:

```bash
# No build step needed - we're using plain Node.js
zerosync simulate
```

### Add New Dependencies

```bash
# Add to specific package
cd packages/sdk-core
npm install <package-name>

# Or from root
npm install <package-name> -w @zerosync/sdk-core
```

---

## 🔗 Integration Checklist

### With Aayush (Contracts)

- [ ] Get Anchor contract ABI
- [ ] Get compiled bytecode
- [ ] Update `packages/contracts-interface/src/index.js`
- [ ] Test deployment with `zerosync deploy`

### With Himanshu (Frontend)

- [ ] Start API: `zerosync run --port 3001`
- [ ] Share endpoint documentation (see README)
- [ ] Test transaction submission
- [ ] Verify batch/proof visualization

---

## 📝 Environment Setup for Deployment

Create `.env` in your project directory:

```env
# Sepolia Testnet
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Or use public RPC (slower)
# RPC_URL=https://rpc.sepolia.org
```

**⚠️ IMPORTANT**: Never commit `.env` to git!

---

## 🐛 Common Issues

### `zerosync: command not found`

Solution:
```bash
npm link packages/cli
```

Or use full path:
```bash
node packages/cli/bin/zerosync.js init my-project
```

### `Cannot find module '@zerosync/sdk-core'`

Solution:
```bash
npm install
```

### Port 3001 already in use

Solution:
```bash
zerosync run --port 3002
```

### PowerShell execution policy error

Solution (run as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎬 Demo Preparation

### Before the Demo

1. Initialize a clean project: `zerosync init demo-rollup`
2. Run simulation: `zerosync simulate --txs 20 --audit`
3. Start API: `zerosync run --port 3001`
4. Have Himanshu's frontend ready to connect
5. (Optional) Have Anchor contract deployed to testnet

### Demo Script

```bash
# 1. Show instant setup
zerosync init judge-demo
cd judge-demo

# 2. Show simulation with audit
zerosync simulate --txs 30 --audit

# 3. Show generated data
cat data/batches.json  # or type data\batches.json on Windows

# 4. Start live mode
zerosync run --port 3001

# 5. In another terminal, submit transactions
curl -X POST http://localhost:3001/api/transactions -H "Content-Type: application/json" -d "{\"from\":\"0xAAA\",\"to\":\"0xBBB\",\"value\":500}"

# 6. Show metrics
curl http://localhost:3001/api/metrics
```

---

## 📚 Next Steps

1. **Read the main README.md** for full documentation
2. **Sync with Aayush** for contract integration
3. **Coordinate with Himanshu** for API testing
4. **Practice the demo flow** end-to-end

---

## 💡 Tips

- Use `--help` on any command to see options
- Check `data/` folder to see what's being stored
- API logs appear in the terminal when running `zerosync run`
- All config is in `zerosync.config.json` - tweak and re-run!

---

**You're all set! 🎉**

Start with: `zerosync init my-first-rollup`
