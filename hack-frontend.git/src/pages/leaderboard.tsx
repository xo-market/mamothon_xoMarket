"use client";
import Layout from "@/components/layout/Layout";
import { useDataContext } from "@/context/DataContext";
import React, { useEffect, useState } from "react";
import numeral from "numeral";

const Leaderboard: React.FC = () => {
  const { getLeaderBoardData } = useDataContext();
  const [leaderBoardData, setLeaderBoardData] = useState();
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    (async () => {
      let res = await getLeaderBoardData();
      console.log(res);
      setLeaderBoardData(res);
    })();
  }, []);

  return (
    <Layout>
      <div className="p-8 bg-white rounded-xl shadow-sm max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
            <p className="text-gray-500 text-sm mt-1">
              Improve your ranking by creating and winning markets
            </p>
          </div>
          <div className="bg-pink-50 px-4 py-2 rounded-lg">
            <span className="text-pink-600 font-medium text-sm">Season 1</span>
          </div>
        </div>

        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          {["All", "Past Week", "Past Month"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-pink-500 text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto mt-4 rounded-xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-left font-semibold">Rank</th>
                <th className="px-6 py-4 text-left font-semibold">User</th>
                <th className="px-6 py-4 text-left font-semibold">Wins</th>
                <th className="px-6 py-4 text-left font-semibold">Losses</th>
                <th className="px-6 py-4 text-left font-semibold">Markets</th>
                <th className="px-6 py-4 text-left font-semibold">Volume</th>
                <th className="px-6 py-4 text-left font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderBoardData &&
                leaderBoardData?.map((player: any, index: any) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 text-gray-900 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-600"
                                : index === 1
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                        ) : (
                          <span className="ml-3">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-pink-600 font-medium">
                        {player?.user_address.slice(0, 6) +
                          "..." +
                          player?.user_address.slice(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {numeral(player?.wins).format("0.0a")}
                    </td>
                    <td className="px-6 py-4 text-red-500">
                      {numeral(player?.losses).format("0.0a")}
                    </td>
                    <td className="px-6 py-4">
                      {numeral(player?.markets).format("0.0a")}
                    </td>
                    <td className="px-6 py-4">
                      {numeral(player?.total_volume).format("0.0a")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-pink-600">
                        {numeral(player?.points).format("0.0a")}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
