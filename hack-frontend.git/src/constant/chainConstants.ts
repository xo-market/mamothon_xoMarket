import { http } from "viem";

const xoTestnet = {
  id: 123420001402,
  name: "xo-testnet",
  iconUrl: "",
  nativeCurrency: { name: "xo-testnet", symbol: "Test", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xo-testnet.t.raas.gelato.cloud"] },
  },
  blockExplorers: {
    default: {
      name: "xo-testnet",
      url: "https://xo-testnet.cloud.blockscout.com",
    },
  },
};

export const chainArray = [xoTestnet];
export const transportsObject = {
  [xoTestnet.id]: http(),
};
