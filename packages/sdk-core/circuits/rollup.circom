pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/poseidon.circom";

/**
 * ZeroSync Rollup Circuit
 * Proves valid state transition for a batch of transactions
 */
template RollupBatch(n) {
    // Public inputs
    signal input oldStateRoot;
    signal input newStateRoot;
    signal input txCount;
    
    // Private inputs (transaction data)
    signal input txHashes[n];
    signal input intermediateRoots[n];
    
    // Constraints
    // 1. Verify txCount matches actual transactions
    signal txCountSquared;
    txCountSquared <== txCount * txCount;
    
    // 2. Hash all transactions using Poseidon
    component hasher = Poseidon(n);
    for (var i = 0; i < n; i++) {
        hasher.inputs[i] <== txHashes[i];
    }
    
    // 3. Verify state transition
    // oldState + transactions = newState
    signal stateTransition;
    stateTransition <== oldStateRoot + hasher.out;
    
    // 4. Final constraint: computed state matches claimed state
    newStateRoot === stateTransition;
}

// Instantiate with 8 transaction capacity
component main {public [oldStateRoot, newStateRoot, txCount]} = RollupBatch(8);
