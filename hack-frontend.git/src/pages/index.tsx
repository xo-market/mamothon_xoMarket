"use client";
import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import HowItWorksPopup from "@/components/notifications/HowItWorksPopup";
import SEO from "@/components/seo/SEO";
import PredictionCard from "@/components/ui/PredictionCard";
import { useDataContext } from "@/context/DataContext";

const CATEGORIES = [
  "Technologies",
  "Memes",
  "Social",
  "Games",
  "NFTs",
  "Music",
  "Sports",
  "Tokens",
];
const TYPEWRITER_TEXTS = [
  {
    heading: "Predict viral trends,",
    subheading: "bet on social media success!",
  },
  {
    heading: "Engagement is currency,",
    subheading: "profit from the next big post!",
  },
  {
    heading: "Turn insights into rewards,",
    subheading: "leverage AI-driven predictions!",
  },
  {
    heading: "Bet on content before it blows up,",
    subheading: "win big with real-time data!",
  },
  {
    heading: "The future of social media bets,",
    subheading: "powered by blockchain & AI!",
  },
];

const Home: React.FC = () => {
  const { fetchAllMarketsData } = useDataContext();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [marketsData, setMarketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayText, setDisplayText] = useState({
    heading: "",
    subheading: "",
  });
  const [isTyping, setIsTyping] = useState(true);

  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const data = await fetchAllMarketsData();
        console.log("Fetched Market Data:", data);

        if (Array.isArray(data)) {
          const uniqueData = Array.from(
            new Map(data.map((item) => [item.id, item])).values(),
          );
          setMarketsData(uniqueData);
          setFilteredMarkets(uniqueData);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [fetchAllMarketsData]);

  // Function to filter markets by category
  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredMarkets(marketsData);
    } else {
      setFilteredMarkets(
        marketsData?.filter(
          (market) =>
            market?.category?.toLowerCase() === category?.toLowerCase(),
        ),
      );
    }
  };

  // Typewriter effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const typeText = async () => {
      const currentText = TYPEWRITER_TEXTS[currentTextIndex];

      // Type heading
      for (let i = 0; i <= currentText.heading.length; i++) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 50);
        });
        setDisplayText((prev) => ({
          ...prev,
          heading: currentText.heading.slice(0, i),
        }));
      }

      // Type subheading
      for (let i = 0; i <= currentText.subheading.length; i++) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 50);
        });
        setDisplayText((prev) => ({
          ...prev,
          subheading: currentText.subheading.slice(0, i),
        }));
      }

      // Pause before deleting
      await new Promise((resolve) => {
        timeoutId = setTimeout(resolve, 2000);
      });

      // Delete text
      for (let i = currentText.subheading.length; i >= 0; i--) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 30);
        });
        setDisplayText((prev) => ({
          ...prev,
          subheading: currentText.subheading.slice(0, i),
        }));
      }

      for (let i = currentText.heading.length; i >= 0; i--) {
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 30);
        });
        setDisplayText((prev) => ({
          ...prev,
          heading: currentText.heading.slice(0, i),
        }));
      }

      // Move to next text
      setCurrentTextIndex((prev) => (prev + 1) % TYPEWRITER_TEXTS.length);
    };

    if (isTyping) {
      typeText();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentTextIndex, isTyping]);

  return (
    <Layout>
      <SEO
        title="Create and Trade predictions Easily on XO-Market."
        description="The ultimate platform for launching and trading predictions on Xo. Create your own predictions effortlessly and engage in fair, dynamic trading."
        image="seo/home.jpg"
      />
      <HowItWorksPopup
        isVisible={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 flex flex-col bg-white">
        <div className="text-center mb-4 ">
          {/* <div className="h-[80px]">
            {" "}
            <h1 className="text-3xl text-black font-bold mb-1">
              {displayText.heading}
            </h1>
            <h2 className="text-2xl text-black mb-3">
              {displayText.subheading}
            </h2>
          </div> */}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto p-4">
          {/* Category Buttons */}
          <button
            onClick={() => handleFilter("All")}
            className={`px-4 py-2 rounded-md font-medium text-xs ${
              selectedCategory === "All"
                ? "bg-pink-500 text-white"
                : "border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={`px-4 py-2 text-xs border border-pink-500 rounded-md transition ${
                selectedCategory === category
                  ? "bg-pink-500 text-white"
                  : "text-pink-500 hover:bg-pink-500 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}

          {/* Dropdowns */}
          <div className="ml-auto flex gap-2">
            <select className="px-4 py-2 border text-black text-xs border-black rounded-md focus:outline-none">
              <option>Tokens</option>
            </select>
            <select className="px-4 py-2 text-black text-xs border border-black rounded-md focus:outline-none">
              <option>Trending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-pulse flex space-x-4 mb-4">
              <div className="h-12 w-12 bg-pink-200 rounded-full"></div>
              <div className="flex-1 space-y-4 max-w-md">
                <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                <div className="h-4 bg-pink-200 rounded"></div>
                <div className="h-4 bg-pink-200 rounded w-5/6"></div>
              </div>
            </div>
            <p className="text-gray-500">Loading prediction markets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 mt-10">
            {filteredMarkets &&
              filteredMarkets?.map((data: any, index: any) => {
                return (
                  <PredictionCard
                    key={index}
                    data={data}
                    onClick={() => console.log("Clicked")}
                  />
                );
              })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
