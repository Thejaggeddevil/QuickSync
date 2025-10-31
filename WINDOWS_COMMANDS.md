# Windows Commands Cheat Sheet

**Quick reference for running ZeroSync on Windows**

---

## 📦 Installation

```powershell
# Install dependencies
npm install

# Link CLI globally
npm link packages/cli
```

---

## 🎯 CLI Commands

```powershell
# Initialize project
zerosync init my-rollup
cd my-rollup

# Simulate
zerosync simulate --txs 20 --audit

# Deploy contract
zerosync deploy --chain sepolia

# Run API server
zerosync run --port 3001
```

---

## 📂 File Operations

```powershell
# View files
type data\batches.json
type data\proofs.json
type zerosync.config.json

# List files
dir data
dir /s  # Recursive

# Create .env file
Copy-Item .env.example .env
notepad .env  # Edit in Notepad
```

---

## 🌐 Testing API (PowerShell)

### Using Invoke-WebRequest

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3001/api/health"

# Get status
Invoke-WebRequest -Uri "http://localhost:3001/api/status" | Select-Object -Expand Content

# Submit transaction
$body = @{
    from = "0x1234"
    to = "0x5678"
    value = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/transactions" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Get batches
Invoke-WebRequest -Uri "http://localhost:3001/api/batches" | Select-Object -Expand Content

# Get metrics
Invoke-WebRequest -Uri "http://localhost:3001/api/metrics" | Select-Object -Expand Content
```

---

## 🌐 Testing API (curl for Windows)

If you have curl installed (Windows 10+):

```cmd
curl http://localhost:3001/api/health

curl http://localhost:3001/api/status

curl -X POST http://localhost:3001/api/transactions ^
  -H "Content-Type: application/json" ^
  -d "{\"from\":\"0x1234\",\"to\":\"0x5678\",\"value\":100}"

curl http://localhost:3001/api/batches

curl http://localhost:3001/api/metrics
```

**Note**: Use `^` for line continuation in CMD, or use PowerShell's backtick `` ` ``

---

## 🔄 Process Management

```powershell
# Start API in background (PowerShell)
Start-Process powershell -ArgumentList "zerosync run --port 3001"

# Find process using port
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <process_id> /F

# Or just press Ctrl+C in the terminal running zerosync
```

---

## 🧪 Full Test Sequence (PowerShell)

```powershell
# Open PowerShell as normal user (not admin needed)

# 1. Setup
cd C:\Users\manas\zerosync-backend
npm install
npm link packages/cli

# 2. Create project
zerosync init test-rollup
cd test-rollup

# 3. Simulate
zerosync simulate --txs 20 --audit

# 4. Check output
type data\batches.json

# 5. Start API (in this window)
zerosync run --port 3001

# 6. Open NEW PowerShell window and test
Invoke-WebRequest -Uri "http://localhost:3001/api/status" | Select-Object -Expand Content

# 7. Submit transaction
$tx = @{from="0xAAA"; to="0xBBB"; value=500} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/api/transactions" -Method POST -ContentType "application/json" -Body $tx

# 8. Check results
Invoke-WebRequest -Uri "http://localhost:3001/api/batches" | Select-Object -Expand Content
```

---

## 🔧 Troubleshooting

### Execution Policy Error

If you get "running scripts is disabled":

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or just use CMD instead:

```cmd
node packages\cli\bin\zerosync.js init my-rollup
```

### Node Modules Not Found

```powershell
npm install
# Or force clean install
Remove-Item -Recurse -Force node_modules
npm install
```

### Port Already in Use

```powershell
# Find what's using the port
netstat -ano | findstr :3001

# Kill it
taskkill /PID <pid> /F

# Or use different port
zerosync run --port 3002
```

---

## 📝 Environment Setup

### Create .env file

```powershell
# Copy example
Copy-Item .env.example .env

# Edit with Notepad
notepad .env

# Or use VS Code
code .env
```

Add your keys:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

---

## 🎬 Demo Preparation (Windows)

### Terminal 1 (API Server)

```powershell
cd C:\Users\manas\zerosync-backend
cd test-rollup
zerosync run --port 3001
```

### Terminal 2 (Testing)

```powershell
# Submit transactions
$tx1 = @{from="0xAAA"; to="0xBBB"; value=1000} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/api/transactions" -Method POST -ContentType "application/json" -Body $tx1

Start-Sleep -Seconds 3

# Check results
Invoke-WebRequest -Uri "http://localhost:3001/api/metrics" | Select-Object -Expand Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## 🔗 Useful Windows Tools

### Windows Terminal (Recommended)

Download from Microsoft Store - supports multiple tabs!

### VS Code Integrated Terminal

```powershell
# Open project in VS Code
code C:\Users\manas\zerosync-backend
# Use Ctrl+` to open terminal
```

### Git Bash (Alternative)

If you prefer Unix-like commands:

```bash
# Use forward slashes
cd /c/Users/manas/zerosync-backend
cat data/batches.json
```

---

## 📊 Quick Status Check

```powershell
# Check if Node.js installed
node --version

# Check if npm installed
npm --version

# Check if zerosync CLI linked
zerosync --version

# Check project structure
tree /F /A
```

---

## 💡 Pro Tips

1. **Use Windows Terminal** - Much better than CMD
2. **PowerShell > CMD** - Better for JSON handling
3. **ConvertFrom-Json** - Parse API responses nicely
4. **Tab completion** - Type `zero` and press Tab
5. **Ctrl+C** - Stop any running process
6. **Ctrl+Break** - Force kill if Ctrl+C doesn't work

---

**You're set up for Windows! 🎉**

Start with: `npm install` then follow quickstart.md
