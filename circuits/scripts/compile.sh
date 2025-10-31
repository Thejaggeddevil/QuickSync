#!/bin/bash
mkdir -p build
circom circuits/batch.circom --r1cs --wasm --sym -o build
snarkjs groth16 setup build/batch.r1cs circuits/powersOfTau28_hez_final_10.ptau build/batch.zkey
snarkjs zkey export verificationkey build/batch.zkey build/verification_key.json
echo "✅ Circuit compiled and keys generated"
