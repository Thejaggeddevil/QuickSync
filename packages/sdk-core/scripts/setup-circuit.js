const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const snarkjs = require('snarkjs');

const CIRCUIT_DIR = path.join(__dirname, '../circuits');
const BUILD_DIR = path.join(__dirname, '../build');

async function setupCircuit() {
  console.log('🔧 Setting up ZeroSync ZK Circuit...\n');

  try {
    // Create build directory
    if (!fs.existsSync(BUILD_DIR)) {
      fs.mkdirSync(BUILD_DIR, { recursive: true });
    }

    console.log('⚠️  NOTE: This requires circom compiler to be installed');
    console.log('   Install with: npm install -g circom');
    console.log('   Or download from: https://docs.circom.io/getting-started/installation/\n');

    // Check if circom is installed
    try {
      const { stdout } = await execAsync('circom --version');
      console.log('✅ Circom found:', stdout.trim());
    } catch (error) {
      console.error('❌ Circom not found. Please install circom first.');
      console.log('\nInstallation instructions:');
      console.log('  Windows: Download from https://github.com/iden3/circom/releases');
      console.log('  Linux/Mac: npm install -g circom or cargo install --git https://github.com/iden3/circom.git');
      process.exit(1);
    }

    // Step 1: Compile circuit
    console.log('📦 Step 1: Compiling circuit...');
    const circuitPath = path.join(CIRCUIT_DIR, 'rollup.circom');
    const r1csPath = path.join(BUILD_DIR, 'rollup.r1cs');
    const wasmPath = path.join(BUILD_DIR, 'rollup.wasm');
    const symPath = path.join(BUILD_DIR, 'rollup.sym');
    
    const { stdout: compileOut } = await execAsync(
      `circom ${circuitPath} -r ${r1csPath} -w ${wasmPath} -s ${symPath}`
    );
    if (compileOut) console.log(compileOut);
    console.log('✅ Circuit compiled\n');
    
    // Move WASM to proper directory structure for snarkjs
    const wasmDir = path.join(BUILD_DIR, 'rollup_js');
    if (!fs.existsSync(wasmDir)) {
      fs.mkdirSync(wasmDir);
    }
    const targetWasmPath = path.join(wasmDir, 'rollup.wasm');
    if (fs.existsSync(wasmPath)) {
      fs.renameSync(wasmPath, targetWasmPath);
    }

    // Step 2: Generate witness calculator
    console.log('📦 Step 2: Witness calculator generated (WASM)\n');

    // Step 3: Powers of Tau (using small ceremony for dev)
    console.log('📦 Step 3: Downloading Powers of Tau (this may take a while)...');
    const ptauPath = path.join(BUILD_DIR, 'powersOfTau28_hez_final_08.ptau');
    
    if (!fs.existsSync(ptauPath)) {
      console.log('   Downloading ptau file (~3MB)...');
      const https = require('https');
      const http = require('http');
      const { pipeline } = require('stream/promises');
      
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(ptauPath);
        const url = 'https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_08.ptau';
        
        https.get(url, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            https.get(response.headers.location, (redirectResponse) => {
              redirectResponse.pipe(file);
              file.on('finish', () => {
                file.close(() => {
                  console.log('   Download complete!');
                  resolve();
                });
              });
            }).on('error', (err) => {
              file.close();
              fs.unlinkSync(ptauPath);
              reject(err);
            });
          } else {
            response.pipe(file);
            file.on('finish', () => {
              file.close(() => {
                console.log('   Download complete!');
                resolve();
              });
            });
          }
        }).on('error', (err) => {
          file.close();
          if (fs.existsSync(ptauPath)) {
            fs.unlinkSync(ptauPath);
          }
          reject(err);
        });
      });
    }
    console.log('✅ Powers of Tau ready\n');

    // Step 4: Generate proving key
    console.log('📦 Step 4: Generating zkey (proving key)...');
    const zkeyPath = path.join(BUILD_DIR, 'rollup_0000.zkey');
    const finalZkeyPath = path.join(BUILD_DIR, 'rollup_final.zkey');

    await snarkjs.zKey.newZKey(r1csPath, ptauPath, zkeyPath);
    console.log('✅ Initial zkey generated\n');

    // Step 5: Contribute to ceremony (for production, do real ceremony)
    console.log('📦 Step 5: Contributing to ceremony...');
    await snarkjs.zKey.contribute(
      zkeyPath,
      finalZkeyPath,
      'zerosync-contribution',
      crypto.randomBytes(32).toString('hex')
    );
    console.log('✅ Final zkey generated\n');

    // Step 6: Export verification key
    console.log('📦 Step 6: Exporting verification key...');
    const vKey = await snarkjs.zKey.exportVerificationKey(finalZkeyPath);
    fs.writeFileSync(
      path.join(BUILD_DIR, 'verification_key.json'),
      JSON.stringify(vKey, null, 2)
    );
    console.log('✅ Verification key exported\n');

    console.log('🎉 Circuit setup complete!');
    console.log('📁 Build artifacts saved to:', BUILD_DIR);
    console.log('\nGenerated files:');
    console.log('  • rollup.r1cs - Rank-1 Constraint System');
    console.log('  • rollup_js/ - Witness calculator (WASM)');
    console.log('  • rollup_final.zkey - Proving key');
    console.log('  • verification_key.json - Verification key');
    console.log('\n✅ Ready to generate real ZK proofs!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Add crypto for randomness
const crypto = require('crypto');

if (require.main === module) {
  setupCircuit();
}

module.exports = { setupCircuit };
