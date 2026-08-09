# Midnight Private Allowlist Access
[![CI Pipeline](https://github.com/shashank/first-quarter-level3-private-allowlist/actions/workflows/ci.yml/badge.svg)](https://github.com/shashank/first-quarter-level3-private-allowlist/actions/workflows/ci.yml)
![Midnight Compact](https://img.shields.io/badge/Midnight-Compact%200.14.0-6366F1)
![License](https://img.shields.io/badge/License-MIT-emerald)

> Production-grade dApp built on the **Midnight Blockchain** for the **First Quarter — Level 3 Hackathon**.  
> Prove membership in a private allowlist using client-side zero-knowledge proofs without revealing identity, wallet address, or secret credentials.

---

## 💡 Problem Statement & Overview
Traditional EVM allowlists store raw addresses on a public ledger. Every time a user claims a token, accesses a gated community, or exercises a membership right, their public address is permanently recorded on-chain, creating a privacy leak that ties their real-world identity to their complete transaction history and wallet holdings.

**Private Allowlist Access** solves this via **Selective Disclosure**:
- An admin maintains hashed member commitments (`SHA256(secretKey || salt)`) structured as a Merkle tree root on the Midnight ledger.
- A user proves membership by executing a **Compact ZK circuit** locally in their browser.
- The circuit verifies inclusion in the Merkle tree root and sets public state `accessGranted = true`.
- The public ledger records ONLY that a valid member proved access — **zero bytes of member identity are ever stored or exposed.**

---

## 🔒 Privacy Model (Explicit Specifications)

An observer of the public ledger **CAN** see:
- `allowlistRoot` (Bytes<32>): Merkle root hash representing the current set of authorized commitments.
- `accessGranted` (Boolean): Public event status flag toggled to `true` when a valid ZK proof is verified.
- `registeredCount` (Uint<32>): Total number of registered commitments.
- `lastEventNonce` (Uint<64>): Monotonically increasing sequence number for event tracking.
- `adminIdentity` (Bytes<32>): Admin authorization identity hash.

An observer of the public ledger **CANNOT** see:
- ❌ Which specific member or address proved access.
- ❌ The caller's wallet address or public key.
- ❌ The caller's raw secret key or blinding salt.
- ❌ The Merkle sibling path or leaf index position of the member.
- ❌ Timing correlation linking a transaction back to a specific identity.

---

## 🏗️ Architecture & Component Flow

```
                                  CLIENT / BROWSER
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │  Private Witness (RAM Only)                                                     │
 │  - secretKey: Bytes<32>                                                        │
 │  - blindingSalt: Bytes<32>                                                     │
 │  - merklePath: Vector<8, Bytes<32>>                                            │
 └──────────────────────┬─────────────────────────────────────────────────────────┘
                        │
                        ▼ (Local Execution)
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │  Compact ZK Proof Circuit (`contract/allowlist.compact`)                       │
 │  1. computeLeafCommitment(secretKey, salt) -> leaf                            │
 │  2. computeMerkleRoot(leaf, merklePath) -> calculatedRoot                     │
 │  3. assert(calculatedRoot == ledger.allowlistRoot)                            │
 └──────────────────────┬─────────────────────────────────────────────────────────┘
                        │
                        ▼ (ZK Proof Output)
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │  MIDNIGHT PUBLIC LEDGER                                                         │
 │  - accessGranted: true  (Public verifiable flag, 0 Identity Leakage)            │
 └──────────────────────┬─────────────────────────────────────────────────────────┘
                        │
                        ▼ (REST Polling / WebSockets)
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │  BACKEND EVENT INDEXER SERVICE (`/indexer`)                                    │
 │  - GET /api/access-status -> { accessGranted: true, privacy: "0 Bytes Leaked" } │
 └────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Repository Structure

```
├── contract/
│   ├── allowlist.compact     # Midnight Compact Smart Contract & ZK Proof Circuit
│   └── src/                  # Merkle tree & witness execution runtime
├── frontend/
│   ├── src/                  # React 18 + Vite + Tailwind CSS dApp UI
│   └── src/midnight-sdk/     # Midnight JS & Lace Wallet connector
├── indexer/                  # Node.js/Express event indexing backend
├── tests/
│   ├── allowlist.test.ts     # ZK circuit & privacy model unit tests
│   ├── indexer.test.ts       # Backend indexer API integration tests
│   └── frontend.test.ts      # Client proof generator tests
├── .github/workflows/
│   └── ci.yml                # GitHub Actions automated test & build pipeline
├── PROPOSAL.md               # Product proposal document
└── DEMO_SCRIPT.md            # 1-minute video demo transcript & outline
```

---

## 🛠️ Quick Start & Running Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone repository
git clone https://github.com/shashank/first-quarter-level3-private-allowlist.git
cd first-quarter-level3-private-allowlist

# Install all monorepo dependencies
npm install
```

### Running the dApp & Services
```bash
# Compile contracts and build all packages
npm run build

# Start Frontend Dev Server & Backend Indexer concurrently
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Instructions

Run the complete Vitest unit & integration test suite (6 passing tests):

```bash
npm test
```

### Test Coverage Highlights:
1. **Test 1**: Valid member proof generation and Compact execution succeeds (`accessGranted = true`).
2. **Test 2**: Non-member secret proof verification fails clean without access granted.
3. **Test 3**: **Zero Identity Leakage Assertion** — Validates that public state JSON contains zero raw secrets, salts, or identity metadata.
4. **Test 4**: Admin commitment registration updates allowlist Merkle root correctly.
5. **Test 5**: Event Indexer backend service state polling and API response validation.
6. **Test 6**: Frontend ZK proof helper proof calculation parity.

---

## 📄 License
MIT License. Created for the Midnight Blockchain Hackathon.
