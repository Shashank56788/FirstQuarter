"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTree = void 0;
exports.sha256Concat = sha256Concat;
exports.computeCommitment = computeCommitment;
const crypto_1 = require("crypto");
/**
 * Utility functions for cryptographic hashing and Merkle tree generation
 * used by the Midnight Allowlist Compact Contract and client-side ZK proof engine.
 */
// SHA256 helper matching Compact contract sha256(a, b)
function sha256Concat(a, b) {
    const hash = (0, crypto_1.createHash)('sha256');
    hash.update(Buffer.from(a, 'hex'));
    hash.update(Buffer.from(b, 'hex'));
    return hash.digest('hex');
}
// Compute leaf commitment from secret key and salt
function computeCommitment(secretKey, salt) {
    return sha256Concat(secretKey, salt);
}
class MerkleTree {
    depth;
    leaves;
    layers;
    defaultLeaf;
    constructor(depth = 8, initialLeaves = []) {
        this.depth = depth;
        this.defaultLeaf = '0'.repeat(64);
        this.leaves = [...initialLeaves];
        // Fill to power of 2 up to 2^depth
        const targetSize = Math.pow(2, depth);
        while (this.leaves.length < targetSize) {
            this.leaves.push(this.defaultLeaf);
        }
        this.layers = [];
        this.buildTree();
    }
    buildTree() {
        this.layers = [this.leaves];
        for (let d = 0; d < this.depth; d++) {
            const currentLayer = this.layers[d];
            const nextLayer = [];
            for (let i = 0; i < currentLayer.length; i += 2) {
                const left = currentLayer[i];
                const right = currentLayer[i + 1] || this.defaultLeaf;
                nextLayer.push(sha256Concat(left, right));
            }
            this.layers.push(nextLayer);
        }
    }
    getRoot() {
        return this.layers[this.depth][0];
    }
    addCommitment(commitment) {
        const nextIndex = this.leaves.findIndex(l => l === this.defaultLeaf);
        const index = nextIndex >= 0 ? nextIndex : this.leaves.length;
        this.leaves[index] = commitment;
        this.buildTree();
        return index;
    }
    getProof(index) {
        if (index < 0 || index >= this.leaves.length) {
            throw new Error(`Index ${index} out of bounds for Merkle tree`);
        }
        const leaf = this.leaves[index];
        const path = [];
        const directions = [];
        let currentIndex = index;
        for (let d = 0; d < this.depth; d++) {
            const currentLayer = this.layers[d];
            const isRight = currentIndex % 2 === 1;
            const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
            const sibling = currentLayer[siblingIndex] || this.defaultLeaf;
            path.push(sibling);
            directions.push(isRight);
            currentIndex = Math.floor(currentIndex / 2);
        }
        return {
            leaf,
            root: this.getRoot(),
            path,
            directions,
            index
        };
    }
    static verifyProof(proof) {
        let current = proof.leaf;
        for (let i = 0; i < proof.path.length; i++) {
            const sibling = proof.path[i];
            const isRight = proof.directions[i];
            if (isRight) {
                current = sha256Concat(sibling, current);
            }
            else {
                current = sha256Concat(current, sibling);
            }
        }
        return current === proof.root;
    }
}
exports.MerkleTree = MerkleTree;
