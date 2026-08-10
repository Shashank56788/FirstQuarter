"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowlistContract = void 0;
const merkle_js_1 = require("./merkle.js");
__exportStar(require("./merkle.js"), exports);
/**
 * Midnight Allowlist Smart Contract Runtime Interface
 * Simulates Midnight Compact ZK circuit execution, private witness resolution,
 * and ledger state transitions.
 */
class AllowlistContract {
    ledger;
    merkleTree;
    registeredCommitments;
    constructor(adminPubKey = '0'.repeat(64), depth = 8) {
        this.merkleTree = new merkle_js_1.MerkleTree(depth);
        this.registeredCommitments = new Set();
        this.ledger = {
            allowlistRoot: this.merkleTree.getRoot(),
            accessGranted: false,
            registeredCount: 0,
            adminIdentity: adminPubKey,
            lastEventNonce: 0
        };
    }
    /**
     * Admin Function: Registers a new hashed member commitment to the contract
     */
    addCommitment(commitment) {
        const index = this.merkleTree.addCommitment(commitment);
        this.registeredCommitments.add(commitment);
        this.ledger.allowlistRoot = this.merkleTree.getRoot();
        this.ledger.registeredCount += 1;
        this.ledger.lastEventNonce += 1;
        return { index, newRoot: this.ledger.allowlistRoot };
    }
    /**
     * Admin Utility: Registers a member given their raw secret and salt
     */
    registerMemberSecret(secretKey, salt) {
        const commitment = (0, merkle_js_1.computeCommitment)(secretKey, salt);
        const { index } = this.addCommitment(commitment);
        return { commitment, index };
    }
    /**
     * User ZK Proof Membership Execution:
     * Takes user private witnesses, verifies ZK inclusion proof locally in client context,
     * updates ledger state accessGranted = true without modifying or logging any user identity.
     */
    proveMembership(witnesses) {
        try {
            // 1. Reconstruct leaf commitment inside ZK context
            const leaf = (0, merkle_js_1.computeCommitment)(witnesses.secretKey, witnesses.blindingSalt);
            // 2. Reconstruct Merkle proof structure
            const proof = {
                leaf,
                root: this.ledger.allowlistRoot,
                path: witnesses.merklePath,
                directions: witnesses.pathDirections,
                index: -1
            };
            // 3. Perform ZK Circuit Constraint Verification
            const isValid = merkle_js_1.MerkleTree.verifyProof(proof);
            if (!isValid) {
                return {
                    success: false,
                    accessGranted: false,
                    ledgerState: { ...this.ledger },
                    proofVerified: false,
                    identityLeaked: false,
                    error: 'ZK Proof Verification Failed: Secret identity is not in the allowlist Merkle tree'
                };
            }
            // 4. Update Public Ledger State
            this.ledger.accessGranted = true;
            this.ledger.lastEventNonce += 1;
            return {
                success: true,
                accessGranted: true,
                ledgerState: { ...this.ledger },
                proofVerified: true,
                identityLeaked: false
            };
        }
        catch (err) {
            return {
                success: false,
                accessGranted: false,
                ledgerState: { ...this.ledger },
                proofVerified: false,
                identityLeaked: false,
                error: err?.message || 'Unknown proof execution error'
            };
        }
    }
    /**
     * Reset accessGranted status
     */
    resetAccessStatus() {
        this.ledger.accessGranted = false;
        return { ...this.ledger };
    }
    /**
     * Read public state ledger (Privacy inspection helper)
     */
    getPublicLedgerState() {
        return { ...this.ledger };
    }
}
exports.AllowlistContract = AllowlistContract;
