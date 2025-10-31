$ErrorActionPreference = 'Stop'
Push-Location "$PSScriptRoot\.."

if (-not (Test-Path build)) { throw 'build folder not found. Run compile.ps1 first.' }

# Ensure ptau exists and is valid-ish (size > 1MB)
$ptau = "powersOfTau28_hez_final_10.ptau"
if ((-not (Test-Path $ptau)) -or ((Get-Item $ptau).Length -lt 1000000)) {
    Write-Host "Attempting to download $ptau..."
    $urls = @(
        'https://raw.githubusercontent.com/iden3/snarkjs/master/packages/snarkjs/ptau/powersOfTau28_hez_final_10.ptau',
        'https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau'
    )
    $downloaded = $false
    foreach ($u in $urls) {
        try {
            Invoke-WebRequest -Uri $u -OutFile $ptau -UseBasicParsing
            if ((Get-Item $ptau).Length -ge 1000000) { $downloaded = $true; break }
        } catch {
            continue
        }
    }
    if (-not $downloaded) {
        Write-Host 'Download failed, generating local Powers of Tau (bn128, power=12) with beacon...'
        if (-not (Test-Path build)) { New-Item -ItemType Directory -Path build | Out-Null }
        npx snarkjs powersoftau new bn128 12 build/pot12.ptau
        npx snarkjs powersoftau beacon build/pot12.ptau build/pot12_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10
        npx snarkjs powersoftau prepare phase2 build/pot12_beacon.ptau $ptau
    }
}

node build/BatchValidator_js/generate_witness.js build/BatchValidator_js/BatchValidator.wasm input.json build/witness.wtns

npx snarkjs groth16 setup build/BatchValidator.r1cs $ptau build/BatchValidator.zkey

npx snarkjs zkey export verificationkey build/BatchValidator.zkey build/verification_key.json

npx snarkjs groth16 prove build/BatchValidator.zkey build/witness.wtns build/proof.json build/public.json

Pop-Location

