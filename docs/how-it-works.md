# How it works

## The problem

A property deed lives in a county recorder's office. An NFT lives on Ethereum.
Nothing about a token transfer updates county records — so a naive "deed NFT"
is just a picture of a house. This template implements the structure that
actually connects the two, the same model used by production tokenized-property
projects.

## The model: LLC wrapper + on-chain deed anchor

```
  County recorder                      Ethereum
  ──────────────                      ────────
  ┌──────────────┐
  │ Recorded     │   SHA-256 of the
  │ deed (LLC    │   recorded deed PDF ──────┐
  │ as grantee)  │                            ▼
  └──────────────┘                    ┌──────────────┐
        ▲                             │   DeedNFT    │
        │ legal title                 │  token #0    │
  ┌──────────────┐                    │  ┌────────┐  │
  │ Single-      │  100% membership   │  │deedHash│  │
  │ purpose LLC  │◄──interest─────────│  │parcelId│  │
  └──────────────┘  (operating        │  │legal   │  │
                      agreement +       │  │desc.   │  │
                      assignment)       └────────┘  │
                                      └──────────────┘
```

1. **The LLC holds legal title.** The property is deeded to a single-purpose
   LLC and that deed is recorded with the county — normal real-estate law,
   nothing exotic.
2. **The NFT represents the LLC.** The operating agreement states the token
   represents 100% of the membership interest. Whoever controls the token
   (plus the signed assignment) controls the entity that owns the house.
3. **The deed hash binds them.** `mintDeed` stores the SHA-256 of the recorded
   deed PDF on-chain. Anyone can recompute the hash of the deed and call
   `verifyDeed` — if it matches, the token provably points at the genuine
   recorded instrument. If a corrective deed is recorded later,
   `updateDeedAnchor` re-anchors it, and the old hash remains in the event log.

## A sale, end to end

1. Buyer and seller agree on price (escrow as usual — the template doesn't
   replace settlement).
2. Seller executes the **Assignment of Membership Interest**
   (`legal/templates/assignment-of-llc-interest.md`).
3. Seller transfers the NFT to the buyer's wallet — the digital counterpart.
4. Parties file whatever the jurisdiction requires (LLC records updates,
   transfer-tax filings).
5. Buyer verifies: recompute the deed hash → `npm run verify` → MATCH.

## What the chain gives you (and what it doesn't)

| On-chain | Off-chain (still required) |
|---|---|
| Immutable pointer to the exact recorded deed | The recording itself |
| Auditable anchor history (every re-anchor is an event) | Title search & insurance |
| 24/7 verifiability by anyone | Attorney-drafted agreements |
| Programmable transfer of the token | Legally effective assignment |

The blockchain is the **evidence and transfer rail**. The county and the
courts are still the **title system**. This template keeps both honest about
their jobs.
