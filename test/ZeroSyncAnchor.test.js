const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZeroSyncAnchor", function () {
  let verifier, anchor;
  let owner, operator, user;
  let genesisRoot;

  beforeEach(async function () {
    [owner, operator, user] = await ethers.getSigners();

    // Deploy Verifier
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();

    // Genesis root
    genesisRoot = ethers.keccak256(ethers.toUtf8Bytes("ZeroSync Test Genesis"));

    // Deploy Anchor
    const Anchor = await ethers.getContractFactory("ZeroSyncAnchor");
    anchor = await Anchor.deploy(await verifier.getAddress(), genesisRoot);
    await anchor.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct initial state", async function () {
      expect(await anchor.latestRoot()).to.equal(genesisRoot);
      expect(await anchor.batchCount()).to.equal(0);
      expect(await anchor.operator()).to.equal(owner.address);
      expect(await anchor.paused()).to.equal(false);
    });

    it("Should mark genesis root as valid", async function () {
      expect(await anchor.isRootValid(genesisRoot)).to.equal(true);
    });

    it("Should revert with zero address verifier", async function () {
      const Anchor = await ethers.getContractFactory("ZeroSyncAnchor");
      await expect(
        Anchor.deploy(ethers.ZeroAddress, genesisRoot)
      ).to.be.revertedWith("Invalid verifier address");
    });
  });

  describe("Mock Batch Submission", function () {
    it("Should submit a mock batch successfully", async function () {
      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.solidityPacked(["uint256"], [12345]));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch1"));

      const tx = await anchor.submitBatchMock(oldRoot, newRoot, batchHash);
      await expect(tx)
        .to.emit(anchor, "ProofSubmitted");

      expect(await anchor.latestRoot()).to.equal(newRoot);
      expect(await anchor.batchCount()).to.equal(1);
    });

    it("Should revert if old root doesn't match", async function () {
      const wrongRoot = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      await expect(
        anchor.submitBatchMock(wrongRoot, newRoot, batchHash)
      ).to.be.revertedWith("Old root mismatch");
    });

    it("Should revert if new root already exists", async function () {
      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      await anchor.submitBatchMock(oldRoot, newRoot, batchHash);

      // Try to submit batch that would create the same newRoot again
      const batchHash2 = ethers.keccak256(ethers.toUtf8Bytes("batch2"));
      await expect(
        anchor.submitBatchMock(newRoot, oldRoot, batchHash2)
      ).to.be.revertedWith("New root already exists");
    });

    it("Should revert if not operator", async function () {
      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      await expect(
        anchor.connect(user).submitBatchMock(oldRoot, newRoot, batchHash)
      ).to.be.revertedWith("Only operator can call");
    });
  });

  describe("Real Proof Submission", function () {
    it("Should submit a real proof successfully", async function () {
      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new_root"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      // Mock proof data (in real scenario, this comes from snarkjs)
      const a = [1, 2];
      const b = [[3, 4], [5, 6]];
      const c = [7, 8];
      const publicSignals = [oldRoot, newRoot, batchHash];

      await expect(
        anchor.connect(user).submitProof(a, b, c, publicSignals)
      )
        .to.emit(anchor, "ProofSubmitted")
        .to.emit(anchor, "ProofVerified");

      expect(await anchor.latestRoot()).to.equal(newRoot);
      expect(await anchor.batchCount()).to.equal(1);

      const batch = await anchor.getBatch(1);
      expect(batch.verified).to.equal(true);
    });

    it("Should revert with invalid proof data", async function () {
      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      const a = [0, 0]; // Invalid
      const b = [[0, 0], [0, 0]];
      const c = [0, 0];
      const publicSignals = [oldRoot, newRoot, batchHash];

      await expect(
        anchor.submitProof(a, b, c, publicSignals)
      ).to.be.revertedWith("Invalid proof point A");
    });
  });

  describe("Batch Queries", function () {
    beforeEach(async function () {
      // Submit 3 mock batches
      for (let i = 1; i <= 3; i++) {
        const oldRoot = await anchor.latestRoot();
        const newRoot = ethers.keccak256(ethers.solidityPacked(["uint256"], [i]));
        const batchHash = ethers.keccak256(ethers.toUtf8Bytes(`batch${i}`));
        await anchor.submitBatchMock(oldRoot, newRoot, batchHash);
      }
    });

    it("Should get batch by ID", async function () {
      const batch = await anchor.getBatch(2);
      expect(batch.batchId).to.equal(2);
      expect(batch.verified).to.equal(false); // Mock batches not verified
    });

    it("Should get latest batches", async function () {
      const batches = await anchor.getLatestBatches(2);
      expect(batches.length).to.equal(2);
      expect(batches[0].batchId).to.equal(3); // Latest first
      expect(batches[1].batchId).to.equal(2);
    });

    it("Should revert on invalid batch ID", async function () {
      await expect(anchor.getBatch(999)).to.be.revertedWith("Invalid batch ID");
      await expect(anchor.getBatch(0)).to.be.revertedWith("Invalid batch ID");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow operator to pause", async function () {
      await anchor.pause();
      expect(await anchor.paused()).to.equal(true);
    });

    it("Should prevent submissions when paused", async function () {
      await anchor.pause();

      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      await expect(
        anchor.submitBatchMock(oldRoot, newRoot, batchHash)
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should allow operator to unpause", async function () {
      await anchor.pause();
      await anchor.unpause();
      expect(await anchor.paused()).to.equal(false);
    });

    it("Should allow operator change", async function () {
      await expect(anchor.setOperator(operator.address))
        .to.emit(anchor, "OperatorUpdated")
        .withArgs(owner.address, operator.address);

      expect(await anchor.operator()).to.equal(operator.address);
    });

    it("Should prevent non-operator from admin functions", async function () {
      await expect(anchor.connect(user).pause()).to.be.revertedWith("Only operator can call");
      await expect(anchor.connect(user).setOperator(user.address)).to.be.revertedWith("Only operator can call");
    });

    it("Should allow verifier update", async function () {
      const NewVerifier = await ethers.getContractFactory("Groth16Verifier");
      const newVerifier = await NewVerifier.deploy();
      await newVerifier.waitForDeployment();

      await anchor.updateVerifier(await newVerifier.getAddress());
      expect(await anchor.verifier()).to.equal(await newVerifier.getAddress());
    });
  });

  describe("Root Validation", function () {
    it("Should validate existing roots", async function () {
      const oldRoot = await anchor.latestRoot();
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new"));
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));

      await anchor.submitBatchMock(oldRoot, newRoot, batchHash);

      expect(await anchor.isRootValid(oldRoot)).to.equal(true);
      expect(await anchor.isRootValid(newRoot)).to.equal(true);
    });

    it("Should reject non-existent roots", async function () {
      const fakeRoot = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      expect(await anchor.isRootValid(fakeRoot)).to.equal(false);
    });
  });
});
