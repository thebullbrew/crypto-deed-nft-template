import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createPublicClient, http, type Abi, type Hex } from "viem";
import { chain, config } from "./config";

/**
 * Verify a deed document against the on-chain anchor.
 *
 * Recomputes SHA-256 of the deed PDF locally and compares it with the
 * deedHash stored for the token. Prints MATCH or MISMATCH.
 *
 * Usage:
 *   TOKEN_ID=0 DEED_PDF=./deed.pdf npm run verify
 */

const ARTIFACT_PATH = join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "DeedNFT.sol",
  "DeedNFT.json"
);

interface ContractArtifact {
  abi: Abi;
}

async function main(): Promise<void> {
  if (!existsSync(ARTIFACT_PATH)) {
    throw new Error("Contract artifact not found — run `npx hardhat compile` first, then retry.");
  }
  if (!config.contractAddress) {
    throw new Error("CONTRACT_ADDRESS is not set — deploy first (`npm run deploy`).");
  }
  const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8")) as ContractArtifact;

  const tokenIdRaw = process.env.TOKEN_ID;
  if (!tokenIdRaw || !/^\d+$/.test(tokenIdRaw)) {
    throw new Error("Set TOKEN_ID to the token to verify, e.g. TOKEN_ID=0.");
  }
  const tokenId = BigInt(tokenIdRaw);

  const deedPath = process.env.DEED_PDF;
  if (!deedPath || !existsSync(deedPath)) {
    throw new Error("Set DEED_PDF to the deed document to check, e.g. DEED_PDF=./deed.pdf.");
  }
  const digest = ("0x" + createHash("sha256").update(readFileSync(deedPath)).digest("hex")) as Hex;

  const publicClient = createPublicClient({ chain, transport: http(config.rpcUrl) });

  const anchor = (await publicClient.readContract({
    address: config.contractAddress,
    abi: artifact.abi,
    functionName: "deedAnchor",
    args: [tokenId],
  })) as {
    deedHash: Hex;
    parcelId: string;
    legalDescription: string;
    deedDocumentURI: string;
    countyRecorderRef: string;
    recordedAt: bigint;
  };

  const match = anchor.deedHash.toLowerCase() === digest.toLowerCase();

  console.log(`Token:         ${tokenId}`);
  console.log(`Parcel ID:     ${anchor.parcelId}`);
  console.log(`Recorder ref:  ${anchor.countyRecorderRef}`);
  console.log(`On-chain hash: ${anchor.deedHash}`);
  console.log(`File hash:     ${digest}`);
  console.log(match ? "\n✅ MATCH — this document is the anchored deed." : "\n❌ MISMATCH — this document differs from the anchored deed.");
  if (!match) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
