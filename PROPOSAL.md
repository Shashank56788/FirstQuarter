# Product Proposal: Private Allowlist Access

### Problem Statement
Traditional EVM-based allowlists and token-gating solutions force users to reveal their public wallet addresses on-chain to prove membership in an exclusive community or whitelist. This public linkage exposes sensitive financial history, wallet balances, transaction patterns, and personal identity to anyone observing the ledger, rendering users vulnerable to targeted spear-phishing, surveillance, and physical security threats.

### Solution Overview
Private Allowlist Access leverages the **Midnight blockchain** and its Compact zero-knowledge smart contract engine to enable selective disclosure. An administrator maintains an allowlist of hashed identity commitments (a Merkle tree root) stored in contract state. Users construct zero-knowledge proofs locally on their device to prove that they possess a secret key matching an entry in the allowlist Merkle tree, without revealing which leaf position, identity, or wallet address is attempting access.

### Why Midnight’s Privacy Model Is Essential
Unlike pseudonymous EVM blockchains where address interaction is permanently broadcast to public state, Midnight provides native support for private state and client-side zero-knowledge witness generation. In Midnight's Compact paradigm, the user's secret key and blinding salt remain strictly within client-side memory; only the mathematical zero-knowledge proof is transmitted to the network. The public ledger records a simple boolean flag (`accessGranted = true`) confirming valid membership without ever storing or revealing a single byte of member identity, making Midnight uniquely capable of enforcing total privacy for gated community access, private token sales, and confidential compliance verification.
