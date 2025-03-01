import { useCreateContext } from "@/context/CreateContext";
import React from "react";
const StartTab: React.FC = () => {
  const {
    createData,
    handleOnChange,
    changeNextTab,
    setCreateData,
    fetchFarcasterData,
  } = useCreateContext();

  return (
    <>
      <div className="mt-4 rounded-md flex items-center justify-between text-black ">
        <input
          type="text"
          name="url"
          onChange={handleOnChange}
          onPaste={(e) => {
            const pastedText = e.clipboardData.getData("text");
            setCreateData((prev) => ({ ...prev, url: pastedText }));
          }}
          placeholder="https://warpcast.com/vitalik.eth/0x0868f688"
          className="w-full px-4 py-2 bg-gray-100 rounded-md"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={changeNextTab}
          className="text-gray-700 font-medium flex items-center space-x-1"
        >
          <span>Next</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </>
  );
};

export default StartTab;
