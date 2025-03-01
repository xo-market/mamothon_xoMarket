"use client";
import React, { useState, useEffect, ReactNode, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { useEthersSigner } from "@/utils/signer";
import { ethers, BigNumber, Contract, providers } from "ethers";
import { toast } from "react-hot-toast";
import { api, apiMultipart } from "@/config";
import {
  Addresses,
  CollateralTokenABI,
  NFTABI,
  MultiOutcomeMarketABI,
} from "@/constant";
import { useRouter } from "next/navigation";
interface DataContextProps {
  getTokenBalance: () => Promise<BigNumber>;
  formatTimestamp: (timestamp: number) => string;
  tokenBalance: BigNumber | number;
  createMarket: (
    _startsAt: number,
    _expiresAt: number,
    _collateralToken: string,
    _initialCollateral: any,
    _creatorFeeBps: any,
    _outcomeCount: any,
    _resolver: string,
    _metaDataURI: string,
  ) => void;
  reviewMarket: (
    _marketId: number,
    _isApproved: boolean,
    _data: string,
  ) => void;
  setMarketResolver: (_resolver: any, _isPublicResolver: boolean) => void;
  setMarketResolverFee: (_feeBps: number) => void;
  getMarketResolver: (_resolver: string) => void;
  resolveMarket: (_marketId: number, _winningOutcome: number) => void;
  buyOutcome: (
    _marketId: number,
    _outcome: number,
    _amount: number,
    _maxCost: number,
  ) => void;
  sellOutcome: (
    _marketId: number,
    _outcome: number,
    _amount: number,
    _minReturn: number,
  ) => void;
  redeemWinnings: (_marketId: number) => void;
  redeemDefaultedMarket: (_marketId: number) => void;
  getRedeemableAmount: (_marketId: number, _amount: number) => void;
  setCollateralTokenAllowed: (_tokenAddress: string, _allowed: Boolean) => void;
  getCollateralTokenAllowed: (_tokenAddress: string) => void;
  setMinimumInitialCollateral: (_amount: number) => void;
  getMinimumInitialCollateral: () => void;
  setProtocolFee: (_feeBps: number) => void;
  getProtocolFee: () => void;
  setInsuranceAddress: (_insuranceAddress: string) => void;
  getInsuranceAddress: () => void;
  getMarket: (_marketId: number) => void;
  getExtendedMarket: (_marketId: number) => void;
  fetchAllMarketsData: () => void;
  getMarketMetadata: (hash: string) => void;
  uploadMarketData: (metadata: any) => void;
  scheduleFarcasterMarket: (marketData: any) => void;
  validateFarcasterMarket: (validationData: any) => void;
  createFarcasterMarket: (marketMetadata: any, farcasterData: any) => void;
  fetchMarketChartPrices: (marketID: number) => void;
  getFaucet: () => void;
  getLeaderBoardData: () => void;
  getUserData: () => void;
  fetchSingleMarketData: (id: number) => void;
}

interface DataContextProviderProps {
  children: ReactNode;
}

// Context initialization
const DataContext = React.createContext<DataContextProps | undefined>(
  undefined,
);

const DataContextProvider: React.FC<DataContextProviderProps> = ({
  children,
}) => {
  const [tokenBalance, setTokenBalance] = useState<BigNumber | number>(0);
  const { address, chain } = useAccount();
  const [activeChain, setActiveChainId] = useState<number | undefined>(
    chain?.id,
  );
  const router = useRouter();
  useEffect(() => {
    setActiveChainId(chain?.id);
  }, [chain?.id]);

  const signer = useEthersSigner({ chainId: activeChain });
  console.log("Signer", activeChain);

  // Create a read-only provider using the custom RPC
  const readOnlyProvider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(
      "https://rpc.xo-testnet.t.raas.gelato.cloud",
    );
  }, []);

  // Function to get contract instance with connected wallet
  const getContractInstance = async (
    contractAddress: string,
    contractAbi: any,
  ): Promise<Contract | null> => {
    try {
      if (!signer) return null;
      return new ethers.Contract(contractAddress, contractAbi, signer);
    } catch (error) {
      console.error("Error getting contract instance:", error);
      return null;
    }
  };

  // Function to get contract instance with read-only provider
  const getReadOnlyContractInstance = (
    contractAddress: string,
    contractAbi: any,
  ): Contract => {
    return new ethers.Contract(contractAddress, contractAbi, readOnlyProvider);
  };

  function generateBinaryPredictionQuestion(metric: string, threshold: number) {
    return `Will this post cross ${threshold} ${metric}?`;
  }

  const getTokenBalance = async () => {
    try {
      if (!activeChain) return BigNumber.from(0);
      const tokenContract = await getContractInstance(
        Addresses[activeChain]?.XOCollateralTokenAddress,
        CollateralTokenABI,
      );
      if (tokenContract) {
        let balance = await tokenContract.balanceOf(address);
        setTokenBalance(balance.div(BigNumber.from(10).pow(18)).toString());
        console.log("Token balance", balance);
        return balance;
      }
    } catch (error) {
      console.log("Error in getting token balance", error);
      return BigNumber.from(0);
    }
  };
  // User -> url -> (Likes,parametres) -> (Choice Params) ->

  const createMarket = async (
    _startsAt: number, // pre define
    _expiresAt: number, //
    _collateralToken: string,
    _initialCollateral: any,
    _creatorFeeBps: any,
    _outcomeCount: any,
    _resolver: string,
    _metaDataURI: string,
  ) => {
    if (!activeChain) return;
    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );
    try {
      if (marketContract) {
        const tx = await marketContract.createMarket(
          _startsAt,
          _expiresAt,
          _collateralToken,
          _initialCollateral,
          _creatorFeeBps,
          _outcomeCount,
          _resolver,
          _metaDataURI,
        );
        const receipt = await tx.wait();
        let marketId;
        for (const log of receipt.logs) {
          try {
            const parsedLog = marketContract.interface.parseLog(log);
            if (parsedLog.name === "MarketCreated") {
              console.log("✅ MarketCreated Event Caught!");
              console.log("Market ID:", parsedLog.args.marketId.toString());
              marketId = parsedLog.args.marketId.toString();
              console.log("Creator:", parsedLog.args[1]); // msg.sender
              console.log("Starts At:", parsedLog.args[2].toString());
              console.log("Expires At:", parsedLog.args[3].toString());
              console.log("Collateral Token:", parsedLog.args[4]);
              console.log("Outcome Count:", parsedLog.args[5].toString());
              console.log("Metadata URI:", parsedLog.args[6]);
            }
          } catch (err) {
            // Ignore logs that don't match the event
          }
        }
        return marketId;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reviewMarket = async (
    _marketId: number,
    _isApproved: boolean,
    _data: string,
  ) => {
    if (!activeChain) return;
    let id = toast.loading("Reviewing market...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.reviewMarket(
          _marketId,
          _isApproved,
          _data,
        );
        await tx.wait();
        toast.success("Market Reviewing successfully", { id });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error in Reviewing market", { id });
    }
  };

  const setMarketResolver = async (
    _resolver: any,
    _isPublicResolver: boolean,
  ) => {
    if (!activeChain) return;
    let id = toast.loading("Setting market resolver...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.setMarketResolver(
          _resolver,
          _isPublicResolver,
        );
        await tx.wait();
        toast.success("Market resolver set successfully", { id });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error in setting market resolver", { id });
    }
  };

  const setMarketResolverFee = async (_feeBps: number) => {
    if (!activeChain) return;
    let id = toast.loading("Setting market resolver fee...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.setMarketResolverFee(_feeBps);
        await tx.wait();
        toast.success("Market resolver fee set successfully", { id });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error in setting market resolver fee", { id });
    }
  };
  const getMarketResolver = async (_resolver: string) => {
    if (!activeChain) return;

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const resolverData = await marketContract.getMarketResolver(_resolver);
        return resolverData; // Returns MarketResolver struct
      }
    } catch (error) {
      console.error("Error fetching market resolver:", error);
      return null;
    }
  };
  function parseMarketDetails(marketDetails: any) {
    return {
      collateralAmount: BigNumber.from(
        marketDetails.collateralAmount,
      ).toString(),
      collateralToken: marketDetails.collateralToken,
      createdAt: new Date(marketDetails.createdAt * 1000).toISOString(), // Convert UNIX timestamp to ISO format
      creatorFeeBps: marketDetails.creatorFeeBps,
      expiresAt: new Date(marketDetails.expiresAt * 1000).toISOString(),
      id: BigNumber.from(marketDetails.id).toNumber(),
      outcomeCount: marketDetails.outcomeCount,
      outcomeTokenStartIndex: BigNumber.from(
        marketDetails.outcomeTokenStartIndex,
      ).toNumber(),
      resolvedAt:
        marketDetails.resolvedAt === 0
          ? null
          : new Date(marketDetails.resolvedAt * 1000).toISOString(),
      resolver: marketDetails.resolver,
      startsAt: new Date(marketDetails.startsAt * 1000).toISOString(),
      status: marketDetails.status,
      winningOutcome: BigNumber.from(marketDetails.winningOutcome).toNumber(),
    };
  }
  const getMarket = async (_marketId: number) => {
    if (!activeChain) return;

    try {
      const marketContract = await getContractInstance(
        Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
        MultiOutcomeMarketABI,
      );

      if (marketContract) {
        const marketDetails = await marketContract.getMarket(_marketId);
        const parsedMarketDetails = parseMarketDetails(marketDetails);
        return parsedMarketDetails;
      }
    } catch (error) {
      console.error("Error fetching market details:", error);
      toast.error("Failed to fetch market details");
      throw error;
    }
  };

  const getExtendedMarket = async (_marketId: number) => {
    if (!activeChain) return;

    try {
      const marketContract = await getContractInstance(
        Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
        MultiOutcomeMarketABI,
      );

      if (marketContract) {
        const extendedMarketDetails =
          await marketContract.getExtendedMarket(_marketId);
        return extendedMarketDetails;
      }
    } catch (error) {
      console.error("Error fetching extended market details:", error);
      toast.error("Failed to fetch extended market details");
      throw error;
    }
  };

  const resolveMarket = async (_marketId: number, _winningOutcome: number) => {
    if (!activeChain) return;

    let id = toast.loading("Resolving market...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.resolveMarket(
          _marketId,
          _winningOutcome,
        );
        await tx.wait();
        toast.success("Market resolved successfully", { id });
      }
    } catch (error) {
      console.error("Error resolving market:", error);
      toast.error("Error resolving market", { id });
    }
  };

  const buyOutcome = async (
    _marketId: number,
    _outcome: number,
    _amount: number,
    _maxCost: number,
  ) => {
    if (!activeChain) return;

    console.log("Buy Outcome", _marketId, _outcome, _amount, _maxCost);

    let id = toast.loading("Processing purchase...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      let collateralToken = await getContractInstance(
        Addresses[activeChain]?.XOCollateralTokenAddress,
        CollateralTokenABI,
      );
      if (!collateralToken) {
        toast.error("Error getting collateral token instance", { id });
        return;
      }
      let allowanceAmount = await collateralToken.allowance(
        address,
        Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      );
      if (allowanceAmount.lt(_maxCost)) {
        const tx = await collateralToken.approve(
          Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
          ethers.utils.parseUnits(_amount.toString(), 18),
        );
        await tx.wait();
      }
      if (marketContract) {
        const tx = await marketContract.buy(
          _marketId,
          _outcome,
          ethers.utils.parseUnits(_amount.toString(), 18),
          ethers.utils.parseUnits(_amount.toString(), 18),
        );
        await tx.wait();
        toast.success("Purchase successful", { id });
      }
    } catch (error) {
      console.error("Error purchasing outcome:", error);
      toast.error("Error purchasing outcome", { id });
    }
  };
  const sellOutcome = async (
    _marketId: number,
    _outcome: number,
    _amount: number,
    _minReturn: number,
  ) => {
    if (!activeChain) return;

    let id = toast.loading("Processing sell...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    console.log(_marketId, _outcome, _amount, _minReturn);

    try {
      if (marketContract) {
        const tx = await marketContract.sell(
          _marketId,
          _outcome,
          ethers.utils.parseUnits(_amount.toString(), 18),
          0,
        );
        await tx.wait();
        toast.success("Sell successful", { id });
      }
    } catch (error) {
      console.error("Error selling outcome:", error);
      toast.error("Error selling outcome", { id });
    }
  };

  const redeemWinnings = async (_marketId: number) => {
    if (!activeChain) return;

    let id = toast.loading("Redeeming winnings...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.redeem(_marketId);
        await tx.wait();
        toast.success("Winnings redeemed successfully", { id });
      }
    } catch (error) {
      console.error("Error redeeming winnings:", error);
      toast.error("Error redeeming winnings", { id });
    }
  };

  const redeemDefaultedMarket = async (_marketId: number) => {
    if (!activeChain) return;

    let id = toast.loading("Redeeming defaulted market...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.redeemDefaultedMarket(_marketId);
        await tx.wait();
        toast.success("Defaulted market redeemed successfully", { id });
      }
    } catch (error) {
      console.error("Error redeeming defaulted market:", error);
      toast.error("Error redeeming defaulted market", { id });
    }
  };

  const getRedeemableAmount = async (_marketId: number, _amount: number) => {
    if (!activeChain) return;
    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const redeemableAmount = await marketContract.getRedeemableAmount(
          _marketId,
          ethers.utils.parseUnits(_amount.toString(), 18), // Ensure correct units
        );
        const formattedAmount = ethers.utils.formatUnits(redeemableAmount, 18);

        return formattedAmount;
      }
    } catch (error) {
      console.error("Error fetching redeemable amount:", error);
    }
  };

  const setCollateralTokenAllowed = async (
    _tokenAddress: string,
    _allowed: Boolean,
  ) => {
    if (!activeChain) return;

    let id = toast.loading("Updating collateral token allowance...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.setCollateralTokenAllowed(
          _tokenAddress,
          _allowed,
        );
        await tx.wait();
        toast.success(
          `Collateral token ${_allowed ? "enabled" : "disabled"} successfully`,
          { id },
        );
      }
    } catch (error) {
      console.error("Error updating collateral token:", error);
      toast.error("Error updating collateral token", { id });
    }
  };

  const getCollateralTokenAllowed = async (_tokenAddress: string) => {
    if (!activeChain) return;
    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );
    try {
      if (marketContract) {
        const isAllowed =
          await marketContract.getCollateralTokenAllowed(_tokenAddress);
        return isAllowed;
      }
    } catch (error) {
      console.error("Error fetching collateral token allowance:", error);
    }
  };

  const setMinimumInitialCollateral = async (_amount: number) => {
    if (!activeChain) return;

    let id = toast.loading("Setting minimum initial collateral...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.setMinimumInitialCollateral(
          ethers.utils.parseUnits(_amount.toString(), 18),
        );
        await tx.wait();
        toast.success(`Minimum initial collateral set to ${_amount}`, { id });
      }
    } catch (error) {
      console.error("Error setting minimum initial collateral:", error);
      toast.error("Error setting minimum initial collateral", { id });
    }
  };

  const getMinimumInitialCollateral = async () => {
    if (!activeChain) return;

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const amount = await marketContract.getMinimumInitialCollateral();
        const formattedAmount = ethers.utils.formatUnits(amount, 18);

        return formattedAmount;
      }
    } catch (error) {
      console.error("Error fetching minimum initial collateral:", error);
    }
  };

  const setProtocolFee = async (_feeBps: number) => {
    if (!activeChain) return;

    let id = toast.loading("Setting protocol fee...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.setProtocolFee(_feeBps);
        await tx.wait();
        toast.success(`Protocol fee set to ${_feeBps} bps`, { id });
      }
    } catch (error) {
      console.error("Error setting protocol fee:", error);
      toast.error("Error setting protocol fee", { id });
    }
  };

  const getProtocolFee = async () => {
    if (!activeChain) return;

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const feeBps = await marketContract.getProtocolFee();

        return feeBps;
      }
    } catch (error) {
      console.error("Error fetching protocol fee:", error);
    }
  };

  const setInsuranceAddress = async (_insuranceAddress: string) => {
    if (!activeChain) return;

    let id = toast.loading("Setting insurance address...");

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const tx = await marketContract.setInsuranceAddress(_insuranceAddress);
        await tx.wait();
        toast.success(`Insurance address set to ${_insuranceAddress}`, { id });
      }
    } catch (error) {
      console.error("Error setting insurance address:", error);
      toast.error("Error setting insurance address", { id });
    }
  };

  const getInsuranceAddress = async () => {
    if (!activeChain) return;

    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );

    try {
      if (marketContract) {
        const address = await marketContract.getInsuranceAddress();

        return address;
      }
    } catch (error) {
      console.error("Error fetching insurance address:", error);
    }
  };
  useEffect(() => {
    if (!signer) return;
    getTokenBalance();
  }, [signer, address, activeChain]);

  const fetchAllMarketsData = async () => {
    try {
      let marketData = await api.get("/market/all?limit=20");
      let markets = marketData?.data?.markets || [];

      // Use the read-only provider to get prices
      let marketsWithPercentages = await Promise.all(
        markets.map(async (market) => {
          const { yesPercentage, noPercentage } =
            await _getPricePercentagesReadOnly(market?.market_id);
          return { ...market, yesPercentage, noPercentage };
        }),
      );
      return marketsWithPercentages;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const _getPricePercentagesReadOnly = async (marketId: number) => {
    let yesPercentage = 50,
      noPercentage = 50;

    try {
      // Use the chain ID from the custom RPC (likely 1337 for your testnet)
      const chainId = await readOnlyProvider
        .getNetwork()
        .then((network) => network.chainId);

      // Get contract using read-only provider
      const marketContract = getReadOnlyContractInstance(
        Addresses[chainId]?.XOMultiOutcomeMarketAddress ||
          Addresses[1337]?.XOMultiOutcomeMarketAddress,
        MultiOutcomeMarketABI,
      );

      if (marketContract) {
        let prices = await marketContract.getPrices(marketId);
        console.log(prices, "prices");
        let yes = +prices[0].toString() / 10 ** 18;
        let no = +prices[1].toString() / 10 ** 18;

        let total = yes + no;
        console.log(yes, no, total, "total");

        yesPercentage = total > 0 ? (yes / total) * 100 : 0;
        noPercentage = total > 0 ? (no / total) * 100 : 0;
      }
    } catch (error) {
      console.error("Error fetching prices from read-only provider:", error);
      // Fall back to default values on error
    }

    return { yesPercentage, noPercentage };
  };

  // Keep the original function for when the wallet is connected
  const _getPricePercentages = async (marketId: number) => {
    if (!activeChain) return;
    let yesPercentage = 50,
      noPercentage = 50;
    const marketContract = await getContractInstance(
      Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      MultiOutcomeMarketABI,
    );
    if (marketContract) {
      let prices = await marketContract.getPrices(marketId);
      console.log(prices, "prices");
      let yes = +prices[0].toString() / 10 ** 18;
      let no = +prices[1].toString() / 10 ** 18;

      let total = yes + no;
      console.log(yes, no, total, "total");

      yesPercentage = total > 0 ? (yes / total) * 100 : 0;
      noPercentage = total > 0 ? (no / total) * 100 : 0;
    }
    return { yesPercentage, noPercentage };
  };

  const fetchSingleMarketData = async (id: number) => {
    try {
      let marketData = await api.get("/market/all");
      if (marketData?.data?.markets.length > 0) {
        let market = marketData?.data?.markets?.find(
          (item) => item.market_id == id,
        );
        if (market) {
          const { yesPercentage, noPercentage } =
            await _getPricePercentages(id);
          return { ...market, yesPercentage, noPercentage };
        }
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  function getMarketMetadata(hash: string) {
    try {
      let metadata = api.get(`/ipfs/get_ipfs/${hash}`);
      return metadata;
    } catch (error) {
      console.log("Not getting any data");
    }
  }

  function uploadMarketData(metadata: any) {
    try {
      let response = api.post("/ipfs/upload_image", metadata);
      return response;
    } catch (error) {
      console.log("Error in uploading data");
    }
  }

  const scheduleFarcasterMarket = async (marketData: any) => {
    try {
      marketData.expiry = new Date(marketData.expiry).toUTCString();
      console.log("New date", new Date(marketData.expiry).toUTCString());
      console.log("new market data", marketData);
      const response = await api.post("/farcaster/schedule", marketData);
      return response.data;
    } catch (error) {
      console.error("Error scheduling Farcaster market:", error);
      throw error;
    }
  };

  // Validate a Farcaster market
  const validateFarcasterMarket = async (validationData: any) => {
    try {
      const response = await api.post(
        "/market/farcaster/validate",
        validationData,
      );
      return response.data;
    } catch (error) {
      console.error("Error validating Farcaster market:", error);
      throw error;
    }
  };

  const fetchMarketChartPrices = async (marketID: number) => {
    try {
      const data = await api.get(`/market/price-chart/${marketID}`);
      return data?.data;
    } catch (error) {
      console.log(error);
    }
  };

  // Create a new Farcaster market
  const createFarcasterMarket = async (
    marketMetadata: any,
    farcasterData: any,
  ) => {
    let id = toast.loading("Creating Farcaster market...");
    try {
      if (!activeChain) {
        return;
      }

      // const ipfsHashResponse = await apiMultipart.post(
      //   "/ipfs/upload_image",
      //   formData
      // );

      // if (!ipfsHashResponse?.data?.success) {
      //   toast.error("Error uploading image to IPFS", { id });
      //   return;
      // }

      const formattedData = {
        name: `${farcasterData?.author?.username} Prediction Market`,
        description: generateBinaryPredictionQuestion(
          marketMetadata?.param,
          marketMetadata?.value,
        ),
        image: `https://client.warpcast.com/v2/cast-image?castHash=${farcasterData?.hash}`,
        attributes: [
          { trait_type: "Category", value: marketMetadata?.category },
          { trait_type: "Type", value: marketMetadata?.param },
          { trait_type: "Tags", value: marketMetadata?.param || [] },
          { trait_type: "Rules", value: marketMetadata?.reward },
        ],
        external_url: `https://your-platform.com/market/1`,
        animation_url:
          "https://ipfs.io/ipfs/bafkreiglmgetqhmrksqwyz7z73ogft4dcwtbzkgiiyij6ofa4ptnl2q2cy",
        background_color: "#FFFFFF",
      };

      const response = await api.post(
        "/market/farcaster/create",
        formattedData,
      );

      if (!response?.data?.success) {
        toast.error("Error creating Farcaster market", { id });
        return;
      }
      const startsAt = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const expiresAtSeconds = Math.floor(
        new Date(marketMetadata?.endDate).getTime() / 1000,
      );
      console.log("Starts At", startsAt, expiresAtSeconds);

      const collateralAmount = ethers.utils.parseUnits(
        marketMetadata?.seed,
        18,
      );
      const startsAtTimestamp = Math.floor(
        new Date(marketMetadata?.startDate).getTime() / 1000,
      );
      const expiresAtTimestamp = Math.floor(
        new Date(marketMetadata?.endDate).getTime() / 1000,
      );

      let collateralTokenInstance = await getContractInstance(
        Addresses[activeChain]?.XOCollateralTokenAddress,
        CollateralTokenABI,
      );

      if (!collateralTokenInstance) {
        toast.error("Error getting collateral token instance", { id });
        return;
      }

      let allowanceAmount = await collateralTokenInstance.allowance(
        address,
        Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
      );

      if (allowanceAmount.lt(collateralAmount)) {
        const tx = await collateralTokenInstance.approve(
          Addresses[activeChain]?.XOMultiOutcomeMarketAddress,
          collateralAmount,
        );
        await tx.wait();
      }

      let marketId = await createMarket(
        startsAtTimestamp,
        expiresAtTimestamp,
        Addresses[activeChain]?.XOCollateralTokenAddress,
        collateralAmount,
        ethers.BigNumber.from(marketMetadata?.reward),
        ethers.BigNumber.from(2),
        "0xa732946c3816e7A7f0Aa0069df259d63385D1BA1",
        `https://ipfs.io/ipfs/${response?.data?.ipfs_hash}`,
      );

      let scheduleRes = await api.post("/market/farcaster/schedule", {
        market_id: marketId,
        cast_url: marketMetadata?.url,
        expiry: new Date(marketMetadata?.endDate).toUTCString(),
        settlement_factor: marketMetadata?.param,
        count: marketMetadata?.value,
        winning_outcome: "0",
      });

      console.log("Farcaster market created successfully:", response);
      toast.success("Farcaster market created successfully", { id });
      router.push("/");
      // return response.data;
    } catch (error) {
      console.error("Error creating Farcaster market:", error);
      toast.error("Error creating Farcaster market", { id });
      throw error;
    }
  };

  const getFaucet = async () => {
    let id = toast.loading("Dripping Faucet..");
    try {
      if (!address) {
        toast.error("No Address Detected !!!", { id });
        return;
      }
      let res = await api.post("/faucet/token", {
        recipient: address,
      });

      toast.success("Driping Completed", { id });
      return;
    } catch (error) {
      toast.error("Driping Failed", { id });
      console.log(error);
    }
  };
  function _sortByPoints(data: any) {
    return data.sort((a, b) => parseFloat(b?.points) - parseFloat(a?.points));
  }
  const getLeaderBoardData = async () => {
    try {
      let res = await api.get("/user/leaderboard");
      let mapData = res?.data?.data;
      return _sortByPoints(mapData);
    } catch (error) {
      throw error;
    }
  };

  const getUserData = async () => {
    try {
      if (!address) {
        return;
      }

      let activity = await api.get(`/user/activity/${address.toLowerCase()}`);
      let currentMarket = await api.get(
        `/user/current-market/${address.toLowerCase()}`,
      );
      let pastMarket = await api.get(
        `/user/past-market/${address.toLowerCase()}`,
      );

      console.log(
        activity?.data?.data,
        currentMarket?.data?.data,
        pastMarket?.data?.data,
      );
      return {
        activity: activity?.data?.data,
        currentMarket: currentMarket?.data?.data,
        pastMarket: pastMarket?.data?.data,
      };
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentMarket = async () => {
    try {
      if (!address) {
        return;
      }

      return res?.data;
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <DataContext.Provider
      value={{
        getTokenBalance,
        formatTimestamp,
        tokenBalance,
        createMarket,
        reviewMarket,
        setMarketResolver,
        setMarketResolverFee,
        getMarketResolver,
        resolveMarket,
        buyOutcome,
        sellOutcome,
        redeemWinnings,
        redeemDefaultedMarket,
        getRedeemableAmount,
        setCollateralTokenAllowed,
        getCollateralTokenAllowed,
        setMinimumInitialCollateral,
        getMinimumInitialCollateral,
        setProtocolFee,
        getProtocolFee,
        setInsuranceAddress,
        getInsuranceAddress,
        getMarket,
        getExtendedMarket,
        fetchAllMarketsData,
        getMarketMetadata,
        uploadMarketData,
        scheduleFarcasterMarket,
        validateFarcasterMarket,
        createFarcasterMarket,
        fetchMarketChartPrices,
        getFaucet,
        getLeaderBoardData,
        getUserData,
        fetchSingleMarketData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataContextProvider");
  }
  return context;
};

export default DataContextProvider;
