import { describe, it, expect } from 'vitest';
import { computeCommitment, MerkleTree } from '../../contract/src/index.js';

describe('Midnight Frontend ZK Proof Helper Test Suite', () => {
  it('Test 6: Frontend proof calculation matches contract expectation', () => {
    const secret = 'user_secret_777';
    const salt = 'blinding_salt_888';

    const commitment = computeCommitment(secret, salt);
    expect(commitment).toHaveLength(64); // Valid SHA256 hex string

    const tree = new MerkleTree(8, [commitment]);
    const proof = tree.getProof(0);

    expect(proof.leaf).toBe(commitment);
    expect(proof.root).toBe(tree.getRoot());
    expect(proof.path).toHaveLength(8);
    expect(proof.directions).toHaveLength(8);
  });
});
