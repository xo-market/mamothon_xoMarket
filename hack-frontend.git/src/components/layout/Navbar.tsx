import React, { useState } from "react";
import Link from "next/link";
import { useLogin, usePrivy, useLogout } from "@privy-io/react-auth";
import { useAccount, useBalance } from "wagmi";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import numeral from "numeral";
import HowItWorksPopup from "@/components/notifications/HowItWorksPopup";
import { useDataContext } from "@/context/DataContext";
const Navbar: React.FC = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const { address } = useAccount();
  const { tokenBalance, getFaucet } = useDataContext();
  const { ready, authenticated, user: privyUser } = usePrivy();
  const router = useRouter();
  const disableLogin = !ready || (ready && authenticated);
  const [showProfile, setShowProfile] = useState(false);
  const toggleShowProfile = () => setShowProfile(!showProfile);
  const { login } = useLogin({
    onComplete: () => {
      router.push("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      router.push("/");
    },
  });
  const { data, isError, isLoading } = useBalance({
    address,
  });

  return (
    <>
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-black">
            <Link href="/">
              <span className="text-pink-500">XO.</span>Market
            </Link>
          </h1>
        </div>

        {/* Navigation Links - Centered */}
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Markets
          </Link>
          <Link
            href="/leaderboard"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Leaderboard
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search xo.market"
            className="w-full px-4 py-2 bg-gray-100 rounded-md text-gray-600 text-sm focus:outline-none"
          />
        </div>

        {/* Right Side: Create Button, Balance & Profile */}
        <div className="flex items-center space-x-6">
          {/* Create Market Button */}
          <Link
            href="/create"
            className="bg-pink-500 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            Create Market
          </Link>

          {/* Balance */}
          <div className="text-center">
            <p className="text-xs text-gray-500">My balance</p>
            <p className="text-sm font-medium text-pink-500">
              {tokenBalance?.toString()} xoUSDC
            </p>
          </div>

          {/* Login/Profile */}
          {!authenticated ? (
            <button
              disabled={disableLogin}
              onClick={login}
              className="bg-pink-500 cursor-pointer text-white px-4 py-2 rounded-md text-sm"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={toggleShowProfile}
                className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1 border border-gray-200"
              >
                <span className="text-sm text-gray-700">
                  {privyUser?.wallet?.address.slice(0, 4) +
                    "..." +
                    privyUser?.wallet?.address.slice(-4)}
                </span>
                <span className="h-8 w-8 bg-gray-100 rounded-full overflow-hidden">
                  <img
                    src={`https://effigy.im/a/${address}.svg`}
                    alt="user profile photo"
                    className="h-full w-full object-cover"
                  />
                </span>
              </button>

              <div
                className="absolute top-12 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-56 overflow-hidden"
                style={{ display: showProfile ? "block" : "none" }}
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Connected as</p>
                  <p className="text-sm font-medium text-gray-800">
                    {privyUser?.wallet?.address.slice(0, 6) +
                      "..." +
                      privyUser?.wallet?.address.slice(-4)}
                  </p>
                </div>

                <div className="py-1">
                  <Link href="/dashboard">
                    <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <svg
                        className="mr-3 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      My Bets
                    </div>
                  </Link>

                  <div
                    onClick={getFaucet}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <svg
                      className="mr-3 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Get Drip Faucet
                  </div>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <svg
                      className="mr-3 h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Logout
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <HowItWorksPopup
        isVisible={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </>
  );
};

export default Navbar;
