$ErrorActionPreference = 'Stop'
Push-Location "$PSScriptRoot\.."

if (-not (Test-Path build)) { throw 'build folder not found. Run compile.ps1 first.' }

node build/BatchValidator_js/generate_witness.js build/BatchValidator.wasm input.json build/witness.wtns

npx snarkjs groth16 setup build/BatchValidator.r1cs powersOfTau28_hez_final_10.ptau build/BatchValidator.zkey

npx snarkjs zkey export verificationkey build/BatchValidator.zkey build/verification_key.json

npx snarkjs groth16 prove build/BatchValidator.zkey build/witness.wtns build/proof.json build/public.json

Pop-Location

