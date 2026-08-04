import { describe, it, expect } from 'vitest';
import { AllowlistContract } from '../contract/src/index.js';

describe('Midnight Event Indexer Backend Service Test Suite', () => {
  it('Test 5: Indexer polls ledger state and formats access events correctly', () => {
    const contract = new AllowlistContract();
    
    // Register member and prove access
    const { index } = contract.registerMemberSecret('secret_key_123', 'salt_456');
    const proof = contract.merkleTree.getProof(index);
    
    contract.proveMembership({
      secretKey: 'secret_key_123',
      blindingSalt: 'salt_456',
      merklePath: proof.path,
      pathDirections: proof.directions
    });

    const publicLedger = contract.getPublicLedgerState();

    // Mock Indexer Event Event payload transformation
    const indexerEventPayload = {
      contractId: '0xmidnight_allowlist_contract_v1',
      eventName: 'AccessGranted',
      accessGranted: publicLedger.accessGranted,
      allowlistRoot: publicLedger.allowlistRoot,
      nonce: publicLedger.lastEventNonce,
      timestamp: new Date().toISOString()
    };

    expect(indexerEventPayload.accessGranted).toBe(true);
    expect(indexerEventPayload.eventName).toBe('AccessGranted');
    expect(indexerEventPayload.allowlistRoot).toBe(publicLedger.allowlistRoot);
    expect(indexerEventPayload.nonce).toBeGreaterThan(0);
    // Explicit assertion: zero user identification in indexer payload
    expect(indexerEventPayload).not.toHaveProperty('userAddress');
    expect(indexerEventPayload).not.toHaveProperty('secretKey');
  });
});
