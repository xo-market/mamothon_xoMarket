import { Chain } from "viem";

interface ChainConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  blockscoutUrl: string;
  dexTarget: number;
  contractAddresses: string[];
}

