"use client";
import Layout from "@/components/layout/Layout";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useDataContext } from "@/context/DataContext";
import { useAccount } from "wagmi";
import Spinner from "@/components/ui/Spinner";
const Dashboard: React.FC = () => {
  const { getUserData, tokenBalance, redeemWinnings } = useDataContext();

  const handleRedeem = async (marketId: number) => {
    await redeemWinnings(marketId);
  };
  const [userData, setUserData] = useState();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("Activity");
  useEffect(() => {
    (async () => {
      let res = await getUserData();
      setUserData(res);
    })();
  }, []);

  return (
    <>
      <Layout>
        <div className="p-6 bg-white rounded-lg shadow-sm w-full max-w-5xl mx-auto">
          {/* Profile Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-28 h-28 bg-pink-400 rounded-full flex overflow-hidden justify-center items-center shadow-md transition-transform hover:scale-105">
                <Image
                  src={`https://effigy.im/a/${address}.svg`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={10}
                  height={10}
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {address?.slice(0, 5) + "..." + address?.slice(-5)}
              </h2>
              <button className="mt-3 px-5 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors shadow-sm">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-3 gap-6 mt-8 p-5 border rounded-xl bg-gray-50 shadow-sm">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm font-medium">Account</p>
              <p className="font-semibold text-black text-lg mt-1">
                {address?.slice(0, 5) + "..." + address?.slice(-5)}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm font-medium">Rank</p>
              <p className="font-semibold text-black text-lg mt-1">5</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm font-medium">Balance</p>
              <p className="font-semibold text-black text-lg mt-1">
                {tokenBalance} xoUSDC
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-8 flex space-x-4 text-black">
            <input
              type="text"
              placeholder="Search your portfolio"
              className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none transition"
            />
            <select className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none">
              <option>All</option>
            </select>
            <select className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none">
              <option>Newest</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex border-b">
            <button
              className={`pb-3 px-6 text-base font-medium border-b-2 transition-colors ${
                activeTab === "Activity"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("Activity")}
            >
              Activity
            </button>
            <button
              className={`pb-3 px-6 text-base font-medium border-b-2 transition-colors ${
                activeTab === "Current Markets"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("Current Markets")}
            >
              Current Markets
            </button>
            <button
              className={`pb-3 px-6 text-base font-medium border-b-2 transition-colors ${
                activeTab === "Past Markets"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("Past Markets")}
            >
              Past Markets
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6 space-y-2">
            {activeTab === "Current Markets" && (
              <div className="overflow-hidden rounded-xl shadow-sm border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-sm uppercase">
                      <th className="px-4 py-3 text-left font-semibold">
                        Market ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Outcome
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Quantity (XO)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Market Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Expires At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData?.currentMarket?.length > 0 ? (
                      userData?.currentMarket?.map((curr: any, index: any) => (
                        <tr
                          key={index}
                          className="border-t text-gray-800 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">{curr.market_id}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${curr.outcome === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {curr.outcome === 0 ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {parseFloat(curr.quantity) / 1e18} XO
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {curr.market_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {curr.market_description}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(
                              parseInt(curr.expires_at) * 1000,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-pulse flex space-x-4 mb-4">
                              <div className="h-12 w-12 bg-pink-200 rounded-full"></div>
                              <div className="flex-1 space-y-4 max-w-md">
                                <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                                <div className="h-4 bg-pink-200 rounded"></div>
                                <div className="h-4 bg-pink-200 rounded w-5/6"></div>
                              </div>
                            </div>
                            <p className="text-gray-500">
                              Loading market data...
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "Past Markets" && (
              <div className="overflow-hidden rounded-xl shadow-sm border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-sm uppercase">
                      <th className="px-4 py-3 text-left font-semibold">
                        Market ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        User Outcome
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Quantity (XO)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Market Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Expired At
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData?.pastMarket?.length > 0 ? (
                      userData?.pastMarket?.map((past: any, index: any) => (
                        <tr
                          key={index}
                          className="border-t text-gray-800 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">{past?.market_id}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${past?.user_outcome === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {past?.user_outcome === 0 ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {parseFloat(past?.quantity) / 1e18} Shares
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {past?.market_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {past?.market_description}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(
                              parseInt(past?.expired_at) * 1000,
                            ).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {past?.is_claimable && !past?.is_redeemed ? (
                              <button
                                onClick={() => handleRedeem(past?.market_id)}
                                className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 transition-colors shadow-sm"
                              >
                                Claim
                              </button>
                            ) : !past?.is_claimable && !past?.is_redeemed ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Lost
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Won
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-pulse flex space-x-4 mb-4">
                              <div className="h-12 w-12 bg-pink-200 rounded-full"></div>
                              <div className="flex-1 space-y-4 max-w-md">
                                <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                                <div className="h-4 bg-pink-200 rounded"></div>
                                <div className="h-4 bg-pink-200 rounded w-5/6"></div>
                              </div>
                            </div>
                            <p className="text-gray-500">
                              Loading past market data...
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "Activity" && (
              <div className="overflow-hidden rounded-xl shadow-sm border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-sm uppercase">
                      <th className="px-4 py-3 text-left font-semibold">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Market ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Transaction Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData?.activity?.length > 0 ? (
                      userData?.activity?.map((act: any, index: any) => (
                        <tr
                          key={index}
                          className="border-t text-gray-800 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {act.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">{act.market_id}</td>
                          <td className="px-4 py-3 font-medium">
                            {parseFloat(act.quantity) / 1e18} Shares
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(parseInt(act.timestamp)).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`https://etherscan.io/tx/${act.txn_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-800 transition-colors"
                            >
                              {act.txn_hash.slice(0, 10)}...
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-pulse flex space-x-4 mb-4">
                              <div className="h-12 w-12 bg-pink-200 rounded-full"></div>
                              <div className="flex-1 space-y-4 max-w-md">
                                <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                                <div className="h-4 bg-pink-200 rounded"></div>
                                <div className="h-4 bg-pink-200 rounded w-5/6"></div>
                              </div>
                            </div>
                            <p className="text-gray-500">
                              Loading activity data...
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
