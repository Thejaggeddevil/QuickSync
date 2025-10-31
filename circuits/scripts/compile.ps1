$ErrorActionPreference = 'Stop'
Push-Location "$PSScriptRoot\.."

if (-not (Test-Path build)) { New-Item -ItemType Directory -Path build | Out-Null }

npx circom BatchValidator.circom --r1cs --wasm --sym -o build

Pop-Location

