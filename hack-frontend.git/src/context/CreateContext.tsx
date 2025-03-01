import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDataContext } from "./DataContext";
import { api } from "@/config";
const CreateContext = createContext<any>(null);

export const CreateProvider = ({ children }: { children: React.ReactNode }) => {
  const { createFarcasterMarket } = useDataContext();
  const [tab, setTab] = useState("start");
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [farcasterData, setFarcasterData] = useState();
  const [createData, setCreateData] = useState({
    url: "",
    param: "",
    value: "",
    endDate: "",
    startDate: "",
    category: "",
    seed: "",
    reward: "2",
  });

  const handleOnChange = (e: any) => {
    e.preventDefault();
    let name = e.target.name;
    let value = e.target.value;

    if (name == "endData" || name == "startDate") {
      const utcDate = new Date(value).toISOString();
      setCreateData((prev) => ({ ...prev, [name]: utcDate }));
    }
    setCreateData((prev) => ({ ...prev, [name]: value }));
  };

  const createMarket = async () => {
    if (
      !createData.url ||
      !createData.param ||
      !createData.value ||
      !createData.endDate ||
      !createData.category ||
      !createData.seed ||
      !createData.reward
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    console.log(createData);
    await createFarcasterMarket(createData, farcasterData);
  };

  useEffect(() => {
    if (createData.url) {
      fetchFarcasterData(createData.url);
    }
  }, [createData.url]);

  const fetchFarcasterData = async (cast_url: any) => {
    let id = toast.loading("Fetching Farcaster Data ...");
    try {
      const response = await api.get(`/farcaster/cast?cast_url=${cast_url}`);
      setFarcasterData(response?.data?.cast);
      console.log(response?.data?.cast);
      toast.success("Farcaster Data Fetch Sucessfully", { id });
      return response.data;
    } catch (error) {
      toast.error("Error Fetching Farcaster market", { id });
      throw error;
    }
  };

  const changeTab = (newTab: string) => setTab(newTab);
  const changeNextTab = () => {
    const tabs = ["start", "define", "provide", "review"];
    const index = tabs.indexOf(tab);
    if (index < tabs.length - 1) setTab(tabs[index + 1]);
  };
  const changePreviousTab = () => {
    const tabs = ["start", "define", "provide", "review"];
    const index = tabs.indexOf(tab);
    if (index > 0) setTab(tabs[index - 1]);
  };

  return (
    <CreateContext.Provider
      value={{
        tab,
        createData,
        image,
        setImage,
        handleOnChange,
        createMarket,
        changeTab,
        changeNextTab,
        changePreviousTab,
        setFormData,
        setCreateData,
        fetchFarcasterData,
        farcasterData,
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export const useCreateContext = () => useContext(CreateContext);
