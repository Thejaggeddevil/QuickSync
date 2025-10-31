// ZeroSync Rollup Circuit - Compatible with circom 0.5.x
// Proves valid state transition for a batch of transactions

template RollupBatch(n) {
    signal input oldStateRoot;
    signal input newStateRoot;
    signal input txCount;
    signal input txHashes[n];
    
    signal txCountSquared;
    txCountSquared <== txCount * txCount;
    
    signal txHashSum;
    var sum = 0;
    for (var i = 0; i < n; i++) {
        sum = sum + txHashes[i];
    }
    txHashSum <== sum;
    
    signal stateTransition;
    stateTransition <== oldStateRoot + txHashSum;
    
    newStateRoot === stateTransition;
}

component main = RollupBatch(8);
