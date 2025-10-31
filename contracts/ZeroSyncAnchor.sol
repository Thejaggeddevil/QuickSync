// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Groth16Verifier.sol";

/**
 * @title ZeroSyncAnchor
 * @dev Main rollup anchor contract that stores batch proofs and state roots
 * @notice This contract verifies ZK proofs and maintains the rollup state on L1
 */
contract ZeroSyncAnchor {
    // ============ State Variables ============
    
    Groth16Verifier public verifier;
    
    uint256 public latestRoot;
    uint256 public batchCount;
    
    address public operator; // Can be upgraded to multi-sig or DAO
    bool public paused;
    
    // ============ Structs ============
    
    struct BatchRecord {
        uint256 batchId;
        uint256 oldRoot;
        uint256 newRoot;
        uint256 batchHash;
        uint256 timestamp;
        bytes32 txHash; // L1 transaction hash
        address submitter;
        bool verified;
    }
    
    // ============ Storage ============
    
    mapping(uint256 => BatchRecord) public batches;
    mapping(uint256 => bool) public rootExists; // Prevent duplicate roots
    
    // ============ Events ============
    
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
    
    // ============ Modifiers ============
    
    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can call");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _verifier, uint256 _genesisRoot) {
        require(_verifier != address(0), "Invalid verifier address");
        
        verifier = Groth16Verifier(_verifier);
        operator = msg.sender;
        latestRoot = _genesisRoot;
        batchCount = 0;
        paused = false;
        
        rootExists[_genesisRoot] = true;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Submit a new batch with ZK proof
     * @param a Proof point A
     * @param b Proof point B
     * @param c Proof point C
     * @param publicSignals [oldRoot, newRoot, batchHash]
     */
    function submitProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory publicSignals
    ) external whenNotPaused returns (uint256) {
        uint256 oldRoot = publicSignals[0];
        uint256 newRoot = publicSignals[1];
        uint256 batchHash = publicSignals[2];
        
        // Validation
        require(oldRoot == latestRoot, "Old root mismatch");
        require(!rootExists[newRoot], "New root already exists");
        require(newRoot != oldRoot, "Roots must differ");
        
        // Verify the proof
        bool isValid = verifier.verifyProof(a, b, c, publicSignals);
        require(isValid, "Invalid proof");
        
        // Update state
        batchCount++;
        latestRoot = newRoot;
        rootExists[newRoot] = true;
        
        // Store batch record
        batches[batchCount] = BatchRecord({
            batchId: batchCount,
            oldRoot: oldRoot,
            newRoot: newRoot,
            batchHash: batchHash,
            timestamp: block.timestamp,
            txHash: bytes32(uint256(uint160(msg.sender))), // Placeholder
            submitter: msg.sender,
            verified: true
        });
        
        emit ProofSubmitted(
            batchCount,
            oldRoot,
            newRoot,
            batchHash,
            msg.sender,
            block.timestamp
        );
        
        emit ProofVerified(batchCount, true);
        
        return batchCount;
    }
    
    /**
     * @dev Submit batch metadata only (for mock mode)
     * @notice Used during development/testing without real proofs
     */
    function submitBatchMock(
        uint256 oldRoot,
        uint256 newRoot,
        uint256 batchHash
    ) external whenNotPaused onlyOperator returns (uint256) {
        require(oldRoot == latestRoot, "Old root mismatch");
        require(!rootExists[newRoot], "New root already exists");
        require(newRoot != oldRoot, "Roots must differ");
        
        batchCount++;
        latestRoot = newRoot;
        rootExists[newRoot] = true;
        
        batches[batchCount] = BatchRecord({
            batchId: batchCount,
            oldRoot: oldRoot,
            newRoot: newRoot,
            batchHash: batchHash,
            timestamp: block.timestamp,
            txHash: bytes32(uint256(uint160(msg.sender))),
            submitter: msg.sender,
            verified: false // Mock mode = not cryptographically verified
        });
        
        emit ProofSubmitted(
            batchCount,
            oldRoot,
            newRoot,
            batchHash,
            msg.sender,
            block.timestamp
        );
        
        return batchCount;
    }
    
    // ============ View Functions ============
    
    function getBatch(uint256 batchId) external view returns (BatchRecord memory) {
        require(batchId > 0 && batchId <= batchCount, "Invalid batch ID");
        return batches[batchId];
    }
    
    function getLatestBatches(uint256 count) external view returns (BatchRecord[] memory) {
        uint256 returnCount = count > batchCount ? batchCount : count;
        BatchRecord[] memory result = new BatchRecord[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            result[i] = batches[batchCount - i];
        }
        
        return result;
    }
    
    function isRootValid(uint256 root) external view returns (bool) {
        return rootExists[root];
    }
    
    // ============ Admin Functions ============
    
    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "Invalid operator address");
        address oldOperator = operator;
        operator = newOperator;
        emit OperatorUpdated(oldOperator, newOperator);
    }
    
    function pause() external onlyOperator {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyOperator {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function updateVerifier(address newVerifier) external onlyOperator {
        require(newVerifier != address(0), "Invalid verifier address");
        verifier = Groth16Verifier(newVerifier);
    }
}
