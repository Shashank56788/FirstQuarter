import { MerkleTree, MerkleProof, computeCommitment, sha256Concat } from './merkle';

export * from './merkle';

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
  identityLeaked: false;
  error?: string;
}

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

  public addCommitment(commitment: string): { index: number; newRoot: string } {
    const index = this.merkleTree.addCommitment(commitment);
    this.registeredCommitments.add(commitment);
    
    this.ledger.allowlistRoot = this.merkleTree.getRoot();
    this.ledger.registeredCount += 1;
    this.ledger.lastEventNonce += 1;

    return { index, newRoot: this.ledger.allowlistRoot };
  }

  public registerMemberSecret(secretKey: string, salt: string): { commitment: string; index: number } {
    const commitment = computeCommitment(secretKey, salt);
    const { index } = this.addCommitment(commitment);
    return { commitment, index };
  }

  public proveMembership(witnesses: PrivateWitnesses): TransactionResult {
    try {
      const leaf = computeCommitment(witnesses.secretKey, witnesses.blindingSalt);
      const proof: MerkleProof = {
        leaf,
        root: this.ledger.allowlistRoot,
        path: witnesses.merklePath,
        directions: witnesses.pathDirections,
        index: -1
      };

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

  public resetAccessStatus(): LedgerState {
    this.ledger.accessGranted = false;
    return { ...this.ledger };
  }

  public getPublicLedgerState(): LedgerState {
    return { ...this.ledger };
  }
}
