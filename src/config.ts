import "dotenv/config";
import { defineChain } from "viem";

/** Ethereum (chain id 1). */
export const chain = defineChain({
  id: 1,
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://eth.llamarpc.com"] } },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
});

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function addressEnv(name: string, optional = false): `0x${string}` | undefined {
  const raw = process.env[name];
  if (!raw) {
    if (optional) return undefined;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  const normalized = raw.startsWith("0x") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{40}$/.test(normalized)) {
    throw new Error(`${name} must be a 20-byte hex address, got "${raw}".`);
  }
  return normalized as `0x${string}`;
}

export const config = {
  get rpcUrl(): string {
    return process.env.RPC_URL ?? "https://eth.llamarpc.com";
  },
  get privateKey(): `0x${string}` {
    const raw = required("PRIVATE_KEY");
    return (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
  },
  get contractAddress(): `0x${string}` | undefined {
    return addressEnv("CONTRACT_ADDRESS", true);
  },
};
