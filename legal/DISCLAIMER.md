# ⚠️ LEGAL DISCLAIMER — READ FIRST

This repository is an **educational software template**. It is not legal advice,
not a title company, and not a substitute for a licensed real-estate attorney in
the jurisdiction where the property sits.

## What this template does NOT do

- **An NFT is not a deed.** In every U.S. state, legal title to real property
  transfers by a written, signed, acknowledged deed **recorded with the county
  recorder / clerk**. A token transfer on Ethereum does not, by itself, convey
  title — no matter what the metadata says.
- **The on-chain deed hash is evidence, not title.** Anchoring the SHA-256 of a
  recorded deed proves *which document* the token refers to. It does not make
  the token a legally recognized instrument of conveyance.
- **Sample documents are samples.** Everything under `legal/templates/` is a
  starting outline, not a finished agreement. Real transactions need documents
  drafted or reviewed by counsel licensed where the property is located.

## The model this template implements

The structure used by real-world tokenized-property projects
(e.g. single-property LLCs whose membership interests are tokenized):

1. A **single-purpose LLC** is formed; the property is deeded into it and the
   deed is recorded with the county.
2. The **NFT represents 100% of the LLC's membership interest** (per the LLC
   operating agreement, which must say so explicitly).
3. The **recorded deed's SHA-256 is anchored on-chain** per token, so anyone can
   verify the token points at the genuine recorded instrument.
4. A **sale = NFT transfer + executed assignment of membership interest** (see
   `legal/templates/assignment-of-llc-interest.md`), plus any filings the
   jurisdiction requires (e.g. updated LLC records, transfer-tax filings).

Skip any of the off-chain legal steps and you have an expensive JPEG pointing
at a house you do not own. Do this properly or not at all.

## Before using this with a real property

- [ ] Retain a real-estate attorney in the property's jurisdiction
- [ ] Run a full title search and resolve liens/encumbrances
- [ ] Confirm your state's LLC and transfer-tax treatment of membership-interest sales
- [ ] Confirm whether the tokenized interest is a security in your facts and circumstances (Howey analysis — get counsel)
- [ ] Record every deed and keep certified copies; the hash must be computed from the *recorded* instrument
