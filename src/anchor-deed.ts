import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Abi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain, config } from "./config";

/**
 * Anchor a recorded deed to a new NFT.
 *
 * Computes SHA-256 of the deed PDF locally (never trust a hash you didn't
 * compute), then calls mintDeed on the DeedNFT contract.
 *
 * Usage:
 *   DEED_PDF=./deed.pdf \
 *   PARCEL_ID="123-45-678" \
 *   LEGAL_DESCRIPTION="Lot 7, Block 3 of ..." \
 *   DEED_URI="ipfs://bafy.../deed.pdf" \
 *   RECORDER_REF="Instrument #2026-0042133" \
 *   RECORDED_AT="2026-09-20" \
 *   RECIPIENT=0x... \
 *   TOKEN_URI="ipfs://bafy.../token.json" \
 *   npm run anchor
 *
 * RECORDED_AT accepts YYYY-MM-DD or a unix timestamp.
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

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function parseRecordedAt(raw: string): bigint {
  if (/^\d+$/.test(raw)) return BigInt(raw);
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) throw new Error(`RECORDED_AT must be YYYY-MM-DD or a unix timestamp, got "${raw}".`);
  return BigInt(Math.floor(ms / 1000));
}

async function main(): Promise<void> {
  if (!existsSync(ARTIFACT_PATH)) {
    throw new Error("Contract artifact not found — run `npx hardhat compile` first, then retry.");
  }
  if (!config.contractAddress) {
    throw new Error("CONTRACT_ADDRESS is not set — deploy first (`npm run deploy`).");
  }
  const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8")) as ContractArtifact;

  const deedPath = env("DEED_PDF");
  if (!existsSync(deedPath)) throw new Error(`Deed PDF not found: ${deedPath}`);
  const deedBytes = readFileSync(deedPath);
  const deedHash = ("0x" + createHash("sha256").update(deedBytes).digest("hex")) as Hex;

  const parcelId = env("PARCEL_ID");
  const legalDescription = env("LEGAL_DESCRIPTION");
  const deedURI = env("DEED_URI");
  const recorderRef = env("RECORDER_REF");
  const recordedAt = parseRecordedAt(env("RECORDED_AT"));
  const recipient = env("RECIPIENT") as `0x${string}`;
  const tokenURI = env("TOKEN_URI");

  console.log(`Deed PDF:      ${deedPath} (${deedBytes.length} bytes)`);
  console.log(`SHA-256:       ${deedHash}`);
  console.log(`Parcel ID:     ${parcelId}`);
  console.log(`Recorder ref:  ${recorderRef}`);
  console.log(`Recorded at:   ${new Date(Number(recordedAt) * 1000).toISOString()}`);
  console.log(`Recipient:     ${recipient}`);

  const account = privateKeyToAccount(config.privateKey);
  const transport = http(config.rpcUrl);
  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ account, chain, transport });

  const hash = await walletClient.writeContract({
    address: config.contractAddress,
    abi: artifact.abi,
    functionName: "mintDeed",
    args: [
      recipient,
      {
        deedHash,
        parcelId,
        legalDescription,
        deedDocumentURI: deedURI,
        countyRecorderRef: recorderRef,
        recordedAt,
      },
      tokenURI,
    ],
  });
  console.log(`\nMint tx: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber}`);
  console.log("Deed anchored. Verify any time with: TOKEN_ID=<id> DEED_PDF=./deed.pdf npm run verify");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
