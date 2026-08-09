# 1-Minute Demo Video Script & Outline
**Hackathon Submission:** Midnight "First Quarter" — Level 3  
**Project:** Private Allowlist Access (Prove Membership Without Revealing Identity)

---

### Video Flow Breakdown (60 Seconds Total)

#### 0:00 – 0:10 | Problem & Hook (10s)
* **Visual:** Display the dApp hero banner highlighting *"Prove Membership in a Private Allowlist Without Revealing Who You Are"*.
* **Voiceover:** *"Traditional allowlists require broadcasting your public wallet address on-chain, exposing your net worth and identity. With Midnight, we built a zero-knowledge private allowlist where users prove membership with zero identity leakage."*

#### 0:10 – 0:25 | Admin Registration & Merkle Tree (15s)
* **Visual:** Admin panel on the left. Click "Auto-Generate" secret/salt credentials and click "Add Hashed Commitment to Tree". Point out the Merkle Root update.
* **Voiceover:** *"The admin registers hashed member commitments onto Midnight's ledger. Only commitment hashes are stored — raw addresses and identities never touch the blockchain."*

#### 0:25 – 0:45 | ZK Proof Generation & Execution (20s)
* **Visual:** Connect Lace Wallet in navbar. Enter secret key & salt in the **Zero-Knowledge Membership Prover** console. Click "Generate & Submit ZK Proof". Show loading state with client ZK circuit constraint evaluation, then highlight the green result badge: **`accessGranted = true`**.
* **Voiceover:** *"As a member, I connect my Lace wallet and input my secret. Midnight's Compact circuit evaluates the Merkle membership constraints locally inside my browser, generating a ZK proof. The transaction executes and sets `accessGranted` to true."*

#### 0:45 – 0:60 | Privacy Model Inspector & Proof of Zero Leakage (15s)
* **Visual:** Click "Privacy Model Specs". Show the live JSON public state dump where identity fields = 0, and compare what the public ledger sees vs. what remains client-side.
* **Voiceover:** *"Anyone observing the public ledger sees `accessGranted = true`. But nobody can determine which member I am, my wallet address, or my secret key. This is privacy by design on Midnight."*
