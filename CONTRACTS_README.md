# ZeroSync Smart Contracts 🔐

Smart contracts for ZeroSync rollup anchoring and ZK proof verification on Ethereum.

## 📦 Contracts

- **Groth16Verifier.sol** - ZK proof verifier (supports both mock and real Groth16 proofs)
- **ZeroSyncAnchor.sol** - Main rollup anchor contract that stores batch proofs and state roots

## 🏗️ Architecture

```
┌─────────────────────┐
│  Off-chain Rollup   │
│   (Sequencer)       │
└──────────┬──────────┘
           │
           │ Submit Proof
           ▼
┌─────────────────────┐      ┌──────────────────┐
│  ZeroSyncAnchor     │─────▶│ Groth16Verifier  │
│  - Store batches    │      │ - Verify proofs  │
│  - Track roots      │      │ - Pairing checks │
└─────────────────────┘      └──────────────────┘
           │
           │ Events
           ▼
┌─────────────────────┐
│   Backend/Frontend  │
│   (Dashboard)       │
└─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Wallet with testnet ETH (for deployment)

### Installation

```bash
npm install
```

### Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Fill in your `.env`:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

Expected output:
```
  ZeroSyncAnchor
    ✓ Should set the correct initial state
    ✓ Should submit a mock batch successfully
    ✓ Should verify real proofs
    ...
  27 passing
```

### Deploy to Local Network

```bash
npx hardhat run scripts/deploy.js --network hardhat
```

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Interact with Deployed Contracts

```bash
npx hardhat run scripts/interact.js --network sepolia
```

## 📋 Contract Interface

### ZeroSyncAnchor

#### Core Functions

**submitProof** - Submit batch with ZK proof
```solidity
function submitProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[3] memory publicSignals // [oldRoot, newRoot, batchHash]
) external returns (uint256 batchId)
```

**submitBatchMock** - Submit batch without proof (mock mode)
```solidity
function submitBatchMock(
    uint256 oldRoot,
    uint256 newRoot,
    uint256 batchHash
) external onlyOperator returns (uint256 batchId)
```

#### View Functions

```solidity
function getBatch(uint256 batchId) external view returns (BatchRecord memory)
function getLatestBatches(uint256 count) external view returns (BatchRecord[] memory)
function isRootValid(uint256 root) external view returns (bool)
```

#### Admin Functions

```solidity
function pause() external onlyOperator
function unpause() external onlyOperator
function setOperator(address newOperator) external onlyOperator
function updateVerifier(address newVerifier) external onlyOperator
```

### Events

```solidity
event ProofSubmitted(
    uint256 indexed batchId,
    uint256 oldRoot,
    uint256 newRoot,
    uint256 batchHash,
    address indexed submitter,
    uint256 timestamp
);

event ProofVerified(uint256 indexed batchId, bool success);
event OperatorUpdated(address indexed oldOperator, address indexed newOperator);
event Paused(address indexed by);
event Unpaused(address indexed by);
```

## 🧪 Testing Strategy

### Unit Tests
- Deployment validation
- Mock batch submission
- Real proof verification
- Access control
- Admin functions
- Edge cases

### Integration Tests (with backend)
1. Deploy contracts to local hardhat node
2. Run backend sequencer
3. Submit transactions
4. Verify batches are anchored on-chain
5. Listen for events

## 🔗 Integration with Backend

### 1. Load Deployment Info

```javascript
const deployment = require('../deployments/sepolia.json');
const { anchor: anchorAddress } = deployment.contracts;
```

### 2. Connect to Contract

```javascript
const { ethers } = require('ethers');
const anchorABI = require('../abi/ZeroSyncAnchor.json');

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const anchor = new ethers.Contract(anchorAddress, anchorABI, wallet);
```

### 3. Submit Batch

```javascript
// Mock mode
const tx = await anchor.submitBatchMock(oldRoot, newRoot, batchHash);
const receipt = await tx.wait();
console.log('Batch submitted:', receipt.hash);

// Real ZK mode
const proof = await generateProof(batch); // From ZK module
const tx = await anchor.submitProof(
    proof.a,
    proof.b,
    proof.c,
    [oldRoot, newRoot, batchHash]
);
```

### 4. Listen for Events

```javascript
anchor.on('ProofSubmitted', (batchId, oldRoot, newRoot, batchHash, submitter, timestamp) => {
    console.log('New batch:', batchId.toString());
    // Update dashboard, database, etc.
});
```

## 📁 Project Structure

```
zerosync-smart-contracts/
├── contracts/
│   ├── Groth16Verifier.sol      # ZK proof verifier
│   └── ZeroSyncAnchor.sol        # Main anchor contract
├── scripts/
│   ├── deploy.js                 # Deployment script
│   └── interact.js               # Test interaction script
├── test/
│   └── ZeroSyncAnchor.test.js   # Comprehensive tests
├── abi/                          # Exported ABIs (auto-generated)
├── deployments/                  # Deployment records (auto-generated)
├── hardhat.config.js            # Hardhat configuration
├── package.json
└── README.md
```

## 🔐 Security Considerations

### Mock vs Real Mode

- **Mock mode** (`submitBatchMock`): For testing/demo, no cryptographic verification
- **Real mode** (`submitProof`): Full Groth16 verification (post-hackathon)

### Access Control

- `operator` role can submit mock batches and pause contract
- Anyone can submit real proofs (trustless)
- Admin functions protected by `onlyOperator` modifier

### Upgradeability

Current design is non-upgradeable for simplicity. For production:
- Use proxy pattern (UUPS or Transparent)
- Multi-sig for operator role
- Timelock for critical changes

## 🛣️ Roadmap

### Phase 1 (Hackathon) ✅
- [x] Mock verifier
- [x] Anchor contract
- [x] Deployment scripts
- [x] Tests
- [x] Documentation

### Phase 2 (Post-Hackathon)
- [ ] Real Circom circuit integration
- [ ] Actual Groth16 verifier from snarkjs
- [ ] Batch verification optimization
- [ ] Gas optimization
- [ ] Audit preparation

### Phase 3 (Production)
- [ ] Security audit
- [ ] Proxy upgrade pattern
- [ ] Multi-sig governance
- [ ] Cross-rollup composability
- [ ] Mainnet deployment

## 🤝 Integration Points

### For Manasvi (Backend)
- Use `deployments/{network}.json` for contract addresses
- Use `abi/ZeroSyncAnchor.json` for contract interface
- Call `submitBatchMock` in mock mode
- Listen for `ProofSubmitted` events

### For Mansi (ZK Circuits)
- Export verifier contract: `snarkjs zkey export solidityverifier circuit.zkey Groth16Verifier.sol`
- Replace mock verifier with real one
- Proof format: `{a: [uint256, uint256], b: [[uint256, uint256], [uint256, uint256]], c: [uint256, uint256]}`
- Public signals: `[oldRoot, newRoot, batchHash]`

### For Himanshu (Frontend)
- Read contract state: `latestRoot`, `batchCount`
- Display batch history: `getLatestBatches(count)`
- Show transaction hashes and Etherscan links
- Real-time updates via event listeners

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [snarkjs Docs](https://github.com/iden3/snarkjs)
- [Circom Docs](https://docs.circom.io/)

## 🐛 Troubleshooting

### "Invalid proof point A" error
- This is expected for all-zero proof inputs
- Use non-zero values for proof points even in mock testing

### "Old root mismatch"
- Ensure you're using the current `latestRoot` from the contract
- Check that previous batch was confirmed

### Gas estimation failed
- Check that contract is not paused
- Verify you're using correct operator address for mock mode
- Ensure proof format matches expected structure

## 📞 Support

For integration help, reach out to:
- Aayush (Contracts): [contact]
- Manasvi (Backend): [contact]
- Mansi (ZK): [contact]
- Himanshu (Frontend): [contact]

---

Built with ❤️ for ETHIndia 2025
