import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useDataContext } from "@/context/DataContext";

interface PredictionCardProps {
  data: any;
  onClick: () => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ data, onClick }) => {
  const { formatTimestamp, buyOutcome, tokenBalance } = useDataContext();
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [outcome, setOutcome] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const checkExpiration = (expirationTimestamp: number) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = expirationTimestamp - currentTime;
    return {
      isExpired: currentTime >= expirationTimestamp,
      timeDifference,
    };
  };

  const handleOutcomeClick = (selectedOutcome: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event propagation
    setOutcome(selectedOutcome);
    setShowBuyForm(true);
  };

  const handleBuy = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event propagation

    if (!amount || outcome === null) return;

    try {
      setIsProcessing(true);
      console.log(`Buying outcome: ${outcome}, amount: ${amount}`);
      await buyOutcome(
        data.market_id,
        outcome,
        parseFloat(amount),
        parseFloat(amount),
      );
      setShowBuyForm(false);
      setAmount("");
      setOutcome(null);
    } catch (error) {
      console.error("Error buying outcome:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event propagation
    setShowBuyForm(false);
    setAmount("");
    setOutcome(null);
  };

  return (
    <div className="border border-pink-300 rounded-xl p-4 shadow-lg relative">
      <Link href={`/prediction/${data?.market_id}`} className="block">
        <div className="flex gap-2 mb-2 border-b border-red-300 py-2">
          {data?.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-pink-200 text-pink-600 text-xs px-3 py-1 rounded-full font-semibold"
            >
              {tag}
            </span>
          ))}
          <span className="bg-pink-200 uppercase text-[#198778] text-xs px-3 py-1 rounded-full font-semibold">
            {data?.category}
          </span>
          <div className="flex justify-content-end">
            {!checkExpiration(data?.expires_at)?.isExpired ? (
              <p>🟢</p>
            ) : (
              <p>🔴</p>
            )}
          </div>
        </div>

        <div className="border border-pink-300 object-cover rounded-lg justify-center items-center flex overflow-hidden mt-4">
          <Image
            src={
              data?.image
                ? data?.image
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdWbSawA3GEvIqk54-RJTyKllWJPfh4RjrDQ&s"
            }
            alt="Market Image"
            className="w-[100%] h-[30vh]"
            width={200}
            height={128}
          />
        </div>

        <p className="font-bold text-black text-lg text-center mt-3">
          {data?.description}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-green-500 text-xs">
            {Number(data?.yesPercentage).toFixed(2)}%
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full rounded-r-none"
              style={{ width: `${Number(data?.yesPercentage).toFixed(2)}%` }}
            ></div>
            <div
              className="absolute top-0 right-0 h-full bg-red-500 rounded-full rounded-l-none"
              style={{ width: `${Number(data?.noPercentage).toFixed(2)}%` }}
            ></div>
          </div>
          <span className="text-pink-500 text-xs">
            {Number(data?.noPercentage).toFixed(2)}%
          </span>
        </div>
      </Link>

      {!showBuyForm ? (
        <div className="flex justify-center mt-3 gap-4">
          <button
            onClick={(e) => handleOutcomeClick(0, e)}
            className="bg-green-100 text-green-600 px-2 py-2 rounded-lg font-semibold w-1/3 hover:bg-green-200 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={(e) => handleOutcomeClick(1, e)}
            className="bg-pink-100 text-pink-600 px-2 py-2 rounded-lg font-semibold w-1/3 hover:bg-pink-200 transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">
              Buy {outcome === 0 ? "Yes" : "No"}
            </p>
            <p className="text-xs text-gray-500">Balance: {tokenBalance} XO</p>
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black"
            max={tokenBalance?.toString()}
          />

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={isProcessing || !amount}
              className={`flex-1 py-1.5 text-sm rounded-md text-white ${
                isProcessing || !amount
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-pink-500 hover:bg-pink-600 transition-colors"
              }`}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      )}

      <Link href={`/prediction/${data?.market_id}`} className="block">
        <div className="flex items-center text-xs text-gray-600 mt-6">
          <span className="flex items-center">
            Starts : <br /> {formatTimestamp(data?.starts_at)}
          </span>
          <span className="flex items-center ml-6">
            End : <br /> {formatTimestamp(data?.expires_at)}
          </span>
          <span className="ml-auto text-pink-500 font-semibold">
            {data?.creator.slice(0, 5) + "..." + data?.creator.slice(-5)}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default PredictionCard;
