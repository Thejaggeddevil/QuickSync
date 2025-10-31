#!/bin/bash
snarkjs groth16 prove build/batch.zkey circuits/input.json build/proof.json build/public.json
echo "✅ Proof generated at build/proof.json"
