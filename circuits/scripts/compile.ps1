$ErrorActionPreference = 'Stop'
Push-Location "$PSScriptRoot\.."

if (-not (Get-Command circom -ErrorAction SilentlyContinue)) {
    throw 'circom v2.x not found on PATH. Install via cargo and retry: cargo install --git https://github.com/iden3/circom --tag v2.1.6'
}

$version = (& circom --version) 2>$null
if ($version -match '^[0-1]\\.' -or $version -match '^0\\.') {
    throw "Found circom $version (npm 0.x). Please use circom 2.x from cargo."
}

if (-not (Test-Path build)) { New-Item -ItemType Directory -Path build | Out-Null }

circom BatchValidator.circom --r1cs --wasm --sym -o build

Pop-Location

