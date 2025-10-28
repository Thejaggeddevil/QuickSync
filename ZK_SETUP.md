# ZeroSync Real ZK Setup Guide

This guide will help you set up real zero-knowledge proofs using Groth16 (via snarkjs + circom).

## Overview

We've integrated:
- **snarkjs** - JavaScript ZK-SNARK library
- **circom** - Circuit compiler
- **Groth16** - ZK proof system
- **Poseidon** - ZK-friendly hash function

## Prerequisites

### 1. Install Circom Compiler

**Windows:**
```powershell
# Download the latest release from:
# https://github.com/iden3/circom/releases
# Extract and add to PATH

# Or use WSL/Git Bash:
curl -sSL https://github.com/iden3/circom/releases/latest/download/circom-windows-amd64.exe -o circom.exe
# Move to a directory in your PATH
```

**Linux/Mac:**
```bash
# Via cargo (Rust required)
cargo install --git https://github.com/iden3/circom.git

# Or download prebuilt binary
curl -sSL https://github.com/iden3/circom/releases/latest/download/circom-linux-amd64 -o circom
chmod +x circom
sudo mv circom /usr/local/bin/
```

Verify installation:
```bash
circom --version
```

### 2. Install Dependencies

```bash
npm install
```

## Setup Process

### Step 1: Compile Circuit & Generate Keys

Run the automated setup script:

```bash
npm run setup-circuit
```

This will:
1. ✅ Compile the `rollup.circom` circuit
2. ✅ Download Powers of Tau ceremony file (~3MB)
3. ✅ Generate proving key (zkey)
4. ✅ Generate verification key
5. ✅ Create all necessary artifacts in `packages/sdk-core/build/`

**Time:** ~1-3 minutes on first run

**Output files:**
```
packages/sdk-core/build/
├── rollup.r1cs                    # Constraint system
├── rollup_js/
│   ├── rollup.wasm                # Witness calculator
│   └── generate_witness.js
├── rollup_final.zkey              # Proving key
└── verification_key.json          # Verification key
```

### Step 2: Test Real ZK Proofs

```bash
npm run test-zk
```

This will:
- Generate a real Groth16 proof for a test batch
- Verify the proof cryptographically
- Show proof generation time

Expected output:
```
🧪 Testing Real Zero-Knowledge Proof Integration...

🔧 ProofEngine initialized
📦 Mock batch created: test-batch-zk
⏳ Generating Groth16 proof...
✅ Proof generated in 1523ms
📄 Proof type: groth16
🔍 Valid: true
🔗 Hash: a3f2e1c9...
🔐 Verifying proof...
✅ Verification result: true

🎉 SUCCESS: Real ZK proofs are working!
🚀 Ready for production deployment
```

## Circuit Details

### What It Proves

The `rollup.circom` circuit proves:
1. Valid state transition: `oldStateRoot + transactions = newStateRoot`
2. Transaction batch integrity (8 tx capacity)
3. Correct tx count

### Circuit Parameters

```circom
template RollupBatch(n = 8) {
    // Public inputs (visible on-chain)
    signal input oldStateRoot;
    signal input newStateRoot;
    signal input txCount;
    
    // Private inputs (hidden)
    signal input txHashes[8];
    signal input intermediateRoots[8];
}
```

### Constraint System Stats

After compilation, check:
```bash
cat packages/sdk-core/build/rollup.r1cs | head
```

Typical stats:
- **Constraints:** ~200-500 (small circuit)
- **Public signals:** 3
- **Private signals:** 16

## Using Real ZK Proofs in Code

### Generate Proof

```javascript
const { ProofEngine } = require('./packages/sdk-core/src/index.js');

const engine = new ProofEngine();

const batch = {
  id: 'batch-001',
  oldStateRoot: '0x1234...',
  stateRoot: '0x5678...',
  txCount: 3,
  transactions: [
    { from: '0xabc', to: '0xdef', value: 100 },
    // ... more transactions
  ]
};

// Generate real Groth16 proof
const proof = await engine.generateGroth16Proof(batch);

console.log('Proof hash:', proof.hash);
console.log('Public signals:', proof.publicSignals);
```

### Verify Proof

```javascript
const isValid = await engine.verifyGroth16Proof(proof);
console.log('Proof valid:', isValid); // true/false
```

## Performance

**Proof Generation:**
- Small circuit (8 tx): ~1-2 seconds
- Medium circuit (32 tx): ~3-5 seconds
- Large circuit (128 tx): ~10-15 seconds

**Proof Verification:**
- On-chain (Solidity): ~250k gas
- Off-chain (JavaScript): ~50-100ms

**Proof Size:**
- Groth16: ~128 bytes (fixed size)
- Public inputs: ~32 bytes each

## Production Considerations

### 1. Trusted Setup

The current setup uses a **test** Powers of Tau ceremony. For production:

```bash
# Use a real MPC ceremony
# Download from trusted sources:
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau
```

### 2. Circuit Auditing

Before mainnet:
- Get circuit formally verified
- Audit for constraint bugs
- Test with edge cases
- Fuzz test inputs

### 3. Hardware Requirements

For faster proving:
- **CPU:** Multi-core (8+ cores recommended)
- **RAM:** 8GB+ for large circuits
- **GPU:** Optional (CUDA/Metal acceleration)

### 4. Optimization

```bash
# Use optimized witness generation
snarkjs wtns calculate rollup_js/rollup.wasm input.json witness.wtns

# Parallel proving (for multiple proofs)
# Use worker threads or distributed system
```

## Troubleshooting

### Error: `circom: command not found`

Install circom compiler (see Prerequisites above).

### Error: `Circuit artifacts not found`

Run: `npm run setup-circuit`

### Error: `WASM instantiation failed`

Increase Node.js memory:
```bash
node --max-old-space-size=4096 packages/sdk-core/scripts/setup-circuit.js
```

### Slow proof generation

1. Check CPU usage (should be 100% during proving)
2. Use smaller circuit for testing
3. Consider hardware acceleration

## Advanced: Custom Circuits

To create your own circuit:

1. **Write circuit** in `packages/sdk-core/circuits/custom.circom`
2. **Compile:**
   ```bash
   circom custom.circom --r1cs --wasm --sym -o build/
   ```
3. **Generate keys:**
   ```bash
   snarkjs groth16 setup custom.r1cs ptau.ptau custom.zkey
   ```
4. **Update ProofEngine** to use new circuit paths

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [snarkjs GitHub](https://github.com/iden3/snarkjs)
- [ZK Whiteboard Sessions](https://zkhack.dev/whiteboard/)
- [Zero Knowledge Proofs: STARKs vs SNARKs](https://consensys.net/blog/blockchain-explained/zero-knowledge-proofs-starks-vs-snarks/)

## Next Steps

1. ✅ Run `npm run setup-circuit`
2. ✅ Test with `npm run test-zk`
3. 🔄 Integrate into your rollup flow
4. 🚀 Deploy verifier contract on-chain

## Support

For issues or questions:
- Check `packages/sdk-core/test-zk-integration.js` for examples
- Review `ProofEngine.js` implementation
- Open an issue on GitHub
