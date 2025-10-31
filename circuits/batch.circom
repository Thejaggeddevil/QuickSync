pragma circom 2.1.6;

include "multiplier.circom";

template BatchTransition() {
    signal input oldRoot;
    signal input newRoot;
    signal input batchHash;

    component m = Multiplier();
    m.a <== oldRoot;
    m.b <== newRoot;

    signal output valid;
    signal diff;
    diff <== m.c - batchHash;
    valid <== diff * diff;
}

component main = BatchTransition();
