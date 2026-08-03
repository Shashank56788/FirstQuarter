import { createHash } from 'crypto';

/**
 * Utility functions for cryptographic hashing and Merkle tree generation
 * used by the Midnight Allowlist Compact Contract and client-side ZK proof engine.
 */

// SHA256 helper matching Compact contract sha256(a, b)
export function sha256Concat(a: string, b: string): string {
  const hash = createHash('sha256');
  hash.update(Buffer.from(a, 'hex'));
  hash.update(Buffer.from(b, 'hex'));
  return hash.digest('hex');
}

// Compute leaf commitment from secret key and salt
export function computeCommitment(secretKey: string, salt: string): string {
  return sha256Concat(secretKey, salt);
}

export interface MerkleProof {
  leaf: string;
  root: string;
  path: string[];
  directions: boolean[]; // false = left sibling, true = right sibling
  index: number;
}

export class MerkleTree {
  public depth: number;
  public leaves: string[];
  public layers: string[][];
  public defaultLeaf: string;

  constructor(depth: number = 8, initialLeaves: string[] = []) {
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

  private buildTree() {
    this.layers = [this.leaves];
    for (let d = 0; d < this.depth; d++) {
      const currentLayer = this.layers[d];
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || this.defaultLeaf;
        nextLayer.push(sha256Concat(left, right));
      }
      this.layers.push(nextLayer);
    }
  }

  public getRoot(): string {
    return this.layers[this.depth][0];
  }

  public addCommitment(commitment: string): number {
    const nextIndex = this.leaves.findIndex(l => l === this.defaultLeaf);
    const index = nextIndex >= 0 ? nextIndex : this.leaves.length;
    this.leaves[index] = commitment;
    this.buildTree();
    return index;
  }

  public getProof(index: number): MerkleProof {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Index ${index} out of bounds for Merkle tree`);
    }

    const leaf = this.leaves[index];
    const path: string[] = [];
    const directions: boolean[] = [];

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

  public static verifyProof(proof: MerkleProof): boolean {
    let current = proof.leaf;
    for (let i = 0; i < proof.path.length; i++) {
      const sibling = proof.path[i];
      const isRight = proof.directions[i];
      if (isRight) {
        current = sha256Concat(sibling, current);
      } else {
        current = sha256Concat(current, sibling);
      }
    }
    return current === proof.root;
  }
}
