$ErrorActionPreference = 'Stop'
Push-Location "$PSScriptRoot\.."

if (-not (Test-Path build/verification_key.json)) { throw 'verification_key.json not found. Run prove.ps1 first.' }

npx snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json

Pop-Location

