/**
 * Pure JavaScript SHA256 implementation for universal compatibility
 * across Node.js, Web Browsers (Vite), and ZK Proof Client engines
 * without Node 'crypto' module dependencies.
 */

function sha256Pure(hexA: string, hexB: string): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const strToBytes = (hex: string): number[] => {
    const bytes: number[] = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16) || 0);
    }
    return bytes;
  };

  const msg = strToBytes(hexA).concat(strToBytes(hexB));
  const l = msg.length * 8;

  msg.push(0x80);
  while ((msg.length + 8) % 64 !== 0) msg.push(0);

  for (let i = 7; i >= 0; i--) {
    msg.push((l >>> (i * 8)) & 0xff);
  }

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  for (let i = 0; i < msg.length; i += 64) {
    const w = new Array(64);
    for (let t = 0; t < 16; t++) {
      w[t] = (msg[i + t * 4] << 24) | (msg[i + t * 4 + 1] << 16) | (msg[i + t * 4 + 2] << 8) | (msg[i + t * 4 + 3]);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      const s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  return H.map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');
}

// SHA256 helper matching Compact contract sha256(a, b)
export function sha256Concat(a: string, b: string): string {
  return sha256Pure(a, b);
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
