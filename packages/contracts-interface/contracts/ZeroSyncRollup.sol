// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RollupVerifier.sol";

/**
 * @title ZeroSyncRollup
 * @notice Main rollup contract with ZK proof verification
 */
contract ZeroSyncRollup {
    Groth16Verifier public verifier;
    
    // State management
    uint256 public currentStateRoot;
    uint256 public batchCounter;
    
    // Batch structure
    struct Batch {
        uint256 batchId;
        uint256 oldStateRoot;
        uint256 newStateRoot;
        uint256 txCount;
        uint256 timestamp;
        bool verified;
    }
    
    mapping(uint256 => Batch) public batches;
    
    // User balances (simplified L2 state)
    mapping(address => uint256) public balances;
    
    // Events
    event Deposit(address indexed user, uint256 amount);
    event BatchSubmitted(uint256 indexed batchId, uint256 newStateRoot);
    event BatchVerified(uint256 indexed batchId);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor(address _verifier, uint256 _initialStateRoot) {
        verifier = Groth16Verifier(_verifier);
        currentStateRoot = _initialStateRoot;
        batchCounter = 0;
    }
    
    /**
     * @notice Deposit funds into the rollup (L1 -> L2)
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit some ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Submit a new batch with ZK proof
     * @param proof The Groth16 proof
     * @param oldStateRoot Previous state root
     * @param newStateRoot New state root after batch
     * @param txCount Number of transactions in batch
     */
    function submitBatch(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint256 oldStateRoot,
        uint256 newStateRoot,
        uint256 txCount
    ) external returns (uint256) {
        require(oldStateRoot == currentStateRoot, "State root mismatch");
        
        // Prepare public inputs for verifier
        uint[3] memory input;
        input[0] = oldStateRoot;
        input[1] = newStateRoot;
        input[2] = txCount;
        
        // Verify the ZK proof
        bool isValid = verifier.verifyProof(a, b, c, input);
        require(isValid, "Invalid ZK proof");
        
        // Create batch
        batchCounter++;
        batches[batchCounter] = Batch({
            batchId: batchCounter,
            oldStateRoot: oldStateRoot,
            newStateRoot: newStateRoot,
            txCount: txCount,
            timestamp: block.timestamp,
            verified: true
        });
        
        // Update state root
        currentStateRoot = newStateRoot;
        
        emit BatchSubmitted(batchCounter, newStateRoot);
        emit BatchVerified(batchCounter);
        
        return batchCounter;
    }
    
    /**
     * @notice Withdraw funds from rollup (L2 -> L1)
     * @dev Simplified - in production, would require Merkle proof
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @notice Get batch details
     */
    function getBatch(uint256 batchId) external view returns (Batch memory) {
        return batches[batchId];
    }
    
    /**
     * @notice Get current state
     */
    function getState() external view returns (
        uint256 stateRoot,
        uint256 totalBatches
    ) {
        return (currentStateRoot, batchCounter);
    }
}
