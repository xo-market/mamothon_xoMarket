"use client";
import React from "react";
import Layout from "@/components/layout/Layout";
import StartTab from "@/components/ui/create-tabs/StartTab";
import { DefineTab } from "@/components/ui/create-tabs/DefineTab";
import { ProvideTab } from "@/components/ui/create-tabs/ProvideTab";
import { ReviewTab } from "@/components/ui/create-tabs/ReviewTab";
import { CreateProvider, useCreateContext } from "@/context/CreateContext";

const CreateComponent: React.FC = () => {
  const { tab, changeTab } = useCreateContext();

  return (
    <div className="container mx-auto flex justify-center items-center min-h-[80vh] py-12">
      <div className="bg-white rounded-xl shadow-md border border-pink-100 p-6 w-2/3 mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Create New Prediction Market
        </h1>

        <div className="flex space-x-1 mb-8">
          {["start", "define", "provide", "review"].map((t, index) => (
            <div key={t} className="flex-1">
              <button
                onClick={() => changeTab(t)}
                className={`w-full py-3 px-4 rounded-lg transition-all ${
                  tab === t
                    ? "bg-pink-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                } font-medium text-sm`}
              >
                <div className="flex items-center justify-center">
                  <span
                    className={`flex items-center justify-center h-6 w-6 rounded-full mr-2 text-xs ${
                      tab === t
                        ? "bg-white text-pink-500"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </div>
              </button>

              {index < 3 && (
                <div
                  className={`h-1 mt-1 ${index < ["start", "define", "provide", "review"].indexOf(tab) ? "bg-pink-500" : "bg-gray-200"}`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          {tab === "start" && <StartTab />}
          {tab === "define" && <DefineTab />}
          {tab === "provide" && <ProvideTab />}
          {tab === "review" && <ReviewTab />}
        </div>
      </div>
    </div>
  );
};

const Create: React.FC = () => {
  return (
    <CreateProvider>
      <Layout>
        <CreateComponent />
      </Layout>
    </CreateProvider>
  );
};

export default Create;
