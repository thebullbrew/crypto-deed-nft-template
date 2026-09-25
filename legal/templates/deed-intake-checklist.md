# Deed Intake Checklist

Run through this **before** minting a DeedNFT for a real property. Every item
feeds either the on-chain anchor, the token metadata, or the legal file.

## Title & deed
- [ ] Full title search completed; title commitment in hand
- [ ] All liens, judgments, and encumbrances identified and resolved or disclosed
- [ ] Certified copy of the **recorded** deed obtained from the county recorder
- [ ] Legal description copied **verbatim** from the deed (not from a listing)
- [ ] Parcel ID / APN confirmed against county tax records
- [ ] Recorder reference captured: book/page **or** instrument number
- [ ] Recording date captured (this becomes `recordedAt`)

## Entity
- [ ] Single-purpose LLC formed in the chosen jurisdiction
- [ ] Operating agreement states the NFT represents 100% membership interest
- [ ] Property deeded into the LLC; that deed recorded
- [ ] EIN obtained; registered agent appointed

## Digital anchor
- [ ] SHA-256 computed from the **recorded** deed PDF (not a draft):
  `shasum -a 256 deed.pdf`
- [ ] Deed PDF pinned to durable storage (IPFS CID or equivalent)
- [ ] Token metadata JSON completed (see `metadata/example-token.json`)
- [ ] `mintDeed` parameters double-checked against the certified deed copy

## Transfer readiness
- [ ] Assignment-of-interest template reviewed by counsel (`legal/templates/`)
- [ ] Transfer-tax treatment confirmed for membership-interest sales in this jurisdiction
- [ ] Securities analysis completed with counsel (Howey)
- [ ] Buyer's wallet address verified out-of-band before any transfer
