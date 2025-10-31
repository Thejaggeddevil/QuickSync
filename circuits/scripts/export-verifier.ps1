$ErrorActionPreference = 'Stop'
Push-Location "$PSScriptRoot\.."

if (-not (Test-Path ..\contracts)) { New-Item -ItemType Directory -Path ..\contracts | Out-Null }

if (-not (Test-Path build/BatchValidator.zkey)) { throw 'BatchValidator.zkey not found. Run prove.ps1 first to create it.' }

npx snarkjs zkey export solidityverifier build/BatchValidator.zkey ..\contracts\Verifier.sol

Pop-Location

