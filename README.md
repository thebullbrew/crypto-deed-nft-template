# DeedNFT Template

![banner](assets/banner.jpg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-627EEA.svg)](https://etherscan.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)](https://soliditylang.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org)

A template for tying a **county-recorded property deed to an NFT** — the
starter kit for real-estate tokenization on Ethereum. Built on
[Hardhat](https://hardhat.org), [OpenZeppelin Contracts](https://openzeppelin.com/contracts),
and [viem](https://viem.sh).

> **Read this first:** an NFT is not a deed. In every U.S. state, title transfers
> by a recorded deed — a token transfer alone conveys nothing. This template
> implements the industry-standard **LLC-wrapper model** (property deeded to a
> single-purpose LLC; the NFT represents 100% of the LLC's membership interest)
> and anchors the **SHA-256 of the recorded deed on-chain**, so the token is
> cryptographically bound to the genuine county-recorded instrument. Full
> honesty in [`legal/DISCLAIMER.md`](legal/DISCLAIMER.md) and the model explained
> in [`docs/how-it-works.md`](docs/how-it-works.md).

## What you get

- **`contracts/DeedNFT.sol`** — ERC-721 with per-token deed anchoring:
  `mintDeed` (anchor a recorded deed at mint), `updateDeedAnchor` (re-anchor
  after a corrective deed — history stays in the event log), `deedAnchor`
  (read the full anchor), `verifyDeed` (on-chain hash comparison).
- **`src/anchor-deed.ts`** — computes SHA-256 of your deed PDF locally and
  mints the anchored token. Never trust a hash you didn't compute.
- **`src/verify-deed.ts`** — recomputes the deed hash and checks it against
  the on-chain anchor. Prints `MATCH` / `MISMATCH`.
- **`src/deploy.ts`** — deploys `DeedNFT`.
- **`metadata/example-token.json`** — token metadata schema with a `deed`
  block (parcel ID, legal description, recorder ref, deed hash, verification).
- **`legal/`** — disclaimer, deed-intake checklist, and a sample assignment-of-
  LLC-interest agreement outline. Samples only — get counsel.

## Quickstart

```bash
npm install
npx hardhat compile
npm run build

cp .env.example .env   # fill in RPC_URL, PRIVATE_KEY
npm run deploy         # set CONTRACT_ADDRESS in .env afterwards

# Anchor a recorded deed to a new NFT:
DEED_PDF=./deed.pdf \
PARCEL_ID="123-45-678" \
LEGAL_DESCRIPTION="Lot 7, Block 3 of ..." \
DEED_URI="ipfs://bafy.../deed.pdf" \
RECORDER_REF="Instrument #2026-0042133" \
RECORDED_AT="2026-09-20" \
RECIPIENT=0xYourAddress \
TOKEN_URI="ipfs://bafy.../token.json" \
npm run anchor

# Verify any time:
TOKEN_ID=0 DEED_PDF=./deed.pdf npm run verify
```

## The model in 30 seconds

1. Form a single-purpose LLC; deed the property into it; **record the deed**.
2. Mint a DeedNFT anchored to the recorded deed's SHA-256 (`npm run anchor`).
3. The operating agreement states the token = 100% LLC membership interest.
4. A sale = NFT transfer **+** executed assignment agreement
   (`legal/templates/assignment-of-llc-interest.md`) **+** required filings.
5. Anyone can verify the token points at the real deed: `npm run verify`.

Details: [`docs/how-it-works.md`](docs/how-it-works.md).
Checklist before touching a real property:
[`legal/templates/deed-intake-checklist.md`](legal/templates/deed-intake-checklist.md).

## Security

- `MINTER_ROLE` controls minting and re-anchoring — guard it like a private key.
- `updateDeedAnchor` exists for corrective deeds only; every re-anchor emits
  the old and new hash, so anchor history is always auditable.
- This template has not been audited. Do not use with real assets until it —
  and your legal structure — has been reviewed by qualified professionals.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
