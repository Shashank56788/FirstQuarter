import { MerkleTree, MerkleProof, computeCommitment, sha256Concat } from './merkle.js';

export * from './merkle.js';

export interface LedgerState {
  allowlistRoot: string;
  accessGranted: boolean;
  registeredCount: number;
  adminIdentity: string;
  lastEventNonce: number;
}

export interface PrivateWitnesses {
  secretKey: string;
  blindingSalt: string;
  merklePath: string[];
  pathDirections: boolean[];
}

export interface TransactionResult {
  success: boolean;
  accessGranted: boolean;
  ledgerState: LedgerState;
  proofVerified: boolean;
  identityLeaked: false; // Explicit privacy guarantee guarantee
  error?: string;
}

/**
 * Midnight Allowlist Smart Contract Runtime Interface
 * Simulates Midnight Compact ZK circuit execution, private witness resolution,
 * and ledger state transitions.
 */
export class AllowlistContract {
  public ledger: LedgerState;
  public merkleTree: MerkleTree;
  public registeredCommitments: Set<string>;

  constructor(adminPubKey: string = '0'.repeat(64), depth: number = 8) {
    this.merkleTree = new MerkleTree(depth);
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
  public addCommitment(commitment: string): { index: number; newRoot: string } {
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
  public registerMemberSecret(secretKey: string, salt: string): { commitment: string; index: number } {
    const commitment = computeCommitment(secretKey, salt);
    const { index } = this.addCommitment(commitment);
    return { commitment, index };
  }

  /**
   * User ZK Proof Membership Execution:
   * Takes user private witnesses, verifies ZK inclusion proof locally in client context,
   * updates ledger state accessGranted = true without modifying or logging any user identity.
   */
  public proveMembership(witnesses: PrivateWitnesses): TransactionResult {
    try {
      // 1. Reconstruct leaf commitment inside ZK context
      const leaf = computeCommitment(witnesses.secretKey, witnesses.blindingSalt);

      // 2. Reconstruct Merkle proof structure
      const proof: MerkleProof = {
        leaf,
        root: this.ledger.allowlistRoot,
        path: witnesses.merklePath,
        directions: witnesses.pathDirections,
        index: -1
      };

      // 3. Perform ZK Circuit Constraint Verification
      const isValid = MerkleTree.verifyProof(proof);

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
    } catch (err: any) {
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
  public resetAccessStatus(): LedgerState {
    this.ledger.accessGranted = false;
    return { ...this.ledger };
  }

  /**
   * Read public state ledger (Privacy inspection helper)
   */
  public getPublicLedgerState(): LedgerState {
    return { ...this.ledger };
  }
}
