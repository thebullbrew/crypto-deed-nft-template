// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title DeedNFT — bind a county-recorded property deed to an ERC-721 token
/// @notice Template implementing the industry-standard tokenization model:
///         the property's legal title is held by a single-purpose LLC, the NFT
///         represents 100% of that LLC's membership interest, and the SHA-256
///         of the recorded deed document is anchored on-chain per token so the
///         NFT is cryptographically bound to the real, county-recorded deed.
///
///         Transferring the token (together with the off-chain assignment
///         agreement in /legal) transfers control of the property-owning
///         entity. The NFT alone is NOT a deed and does NOT transfer legal
///         title by itself — see legal/DISCLAIMER.md.
contract DeedNFT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct DeedAnchor {
        bytes32 deedHash; // SHA-256 digest of the recorded deed document (PDF)
        string parcelId; // APN / parcel number, e.g. "123-45-678"
        string legalDescription; // legal description exactly as on the deed
        string deedDocumentURI; // e.g. ipfs://<cid> of the deed PDF
        string countyRecorderRef; // book/page or instrument number
        uint64 recordedAt; // unix timestamp of county recording
    }

    uint256 private _nextTokenId;
    mapping(uint256 => DeedAnchor) private _anchors;

    event DeedAnchored(uint256 indexed tokenId, bytes32 indexed deedHash, string parcelId);
    event DeedAnchorUpdated(
        uint256 indexed tokenId,
        bytes32 indexed oldHash,
        bytes32 indexed newHash
    );

    constructor(address admin) ERC721("DeedNFT", "DEED") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /// @notice Mint a token anchored to a recorded deed.
    /// @param to Recipient (typically the property-holding LLC's controller).
    /// @param anchor Deed anchor. `deedHash` is the SHA-256 of the recorded deed
    ///        PDF — compute off-chain with scripts/anchor-deed.ts, never trust
    ///        a hash you didn't compute.
    function mintDeed(
        address to,
        DeedAnchor calldata anchor,
        string calldata tokenURI_
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(anchor.deedHash != bytes32(0), "DeedNFT: empty deed hash");
        require(bytes(anchor.parcelId).length > 0, "DeedNFT: empty parcel id");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _anchors[tokenId] = anchor;
        _setTokenURI(tokenId, tokenURI_);

        emit DeedAnchored(tokenId, anchor.deedHash, anchor.parcelId);
        return tokenId;
    }

    /// @notice Re-anchor after a deed is re-recorded (e.g. corrective deed).
    ///         The old hash stays in the event log — the full anchor history is
    ///         always auditable on-chain.
    function updateDeedAnchor(
        uint256 tokenId,
        bytes32 newHash,
        string calldata newDocumentURI,
        string calldata newRecorderRef,
        uint64 newRecordedAt
    ) external onlyRole(MINTER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "DeedNFT: nonexistent token");
        require(newHash != bytes32(0), "DeedNFT: empty deed hash");

        bytes32 oldHash = _anchors[tokenId].deedHash;
        _anchors[tokenId].deedHash = newHash;
        _anchors[tokenId].deedDocumentURI = newDocumentURI;
        _anchors[tokenId].countyRecorderRef = newRecorderRef;
        _anchors[tokenId].recordedAt = newRecordedAt;

        emit DeedAnchorUpdated(tokenId, oldHash, newHash);
    }

    /// @notice Read the full deed anchor for a token.
    function deedAnchor(uint256 tokenId) external view returns (DeedAnchor memory) {
        require(_ownerOf(tokenId) != address(0), "DeedNFT: nonexistent token");
        return _anchors[tokenId];
    }

    /// @notice Verify a deed document against the on-chain anchor.
    /// @param documentDigest SHA-256 of the deed PDF, computed off-chain
    ///        (scripts/verify-deed.ts). Returns true only on exact match.
    function verifyDeed(uint256 tokenId, bytes32 documentDigest) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "DeedNFT: nonexistent token");
        return _anchors[tokenId].deedHash == documentDigest;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
