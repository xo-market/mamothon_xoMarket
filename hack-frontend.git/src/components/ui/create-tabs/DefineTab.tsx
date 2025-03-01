import Image from "next/image";
import { useState } from "react";
import { useCreateContext } from "@/context/CreateContext";

export const DefineTab: React.FC = () => {
  const {
    createData,
    handleOnChange,
    setImage,
    image,
    changeNextTab,
    changePreviousTab,
    setFormData,
    farcasterData,
  } = useCreateContext();
  const [fileName, setFileName] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      const fd = new FormData();
      fd.append("file", file);
      setFormData(fd);
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      simulateUpload(); // Simulate upload progress
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  return (
    <>
      <div className="grid grid-cols-2 gap-8 mt-4 text-black ">
        <div>
          <label className="text-gray-700 text-md">
            What are you betting on?
          </label>
          <select
            name="param"
            value={createData?.param}
            onChange={(e) => handleOnChange(e)}
            className="w-full border border-gray-300 rounded-md px-2 py-3 mt-2"
          >
            <option value="null">Select Cast Parameter</option>
            <option value="likes">Likes</option>
            <option value="recasts">Recasts</option>
            <option value="replies">Replies</option>
          </select>
        </div>
        <div>
          <label className="text-gray-700 text-md">Write a value</label>
          <input
            type="number"
            name="value"
            min={
              createData?.param === "likes"
                ? farcasterData?.reactions?.likes_count
                : createData?.param === "recasts"
                  ? farcasterData?.reactions?.recasts_count
                  : createData?.param === "replies"
                    ? farcasterData?.replies?.count
                    : 0
            }
            value={createData?.value}
            onChange={(e) => handleOnChange(e)}
            className="w-full border border-gray-300 rounded-md px-2 py-3 mt-2"
            placeholder={`${
              createData?.param === "likes"
                ? farcasterData?.reactions?.likes_count
                : createData?.param === "recasts"
                  ? farcasterData?.reactions?.recasts_count
                  : createData?.param === "replies"
                    ? farcasterData?.replies?.count
                    : 0
            } minimum value`}
          />
        </div>
        <input
          type="datetime-local"
          name="startDate"
          value={createData?.startDate}
          onChange={(e) => handleOnChange(e)}
          className="w-full border border-gray-300 rounded-md px-2 py-3 mt-2"
          placeholder="Start Date"
        />
        <input
          type="datetime-local"
          name="endDate"
          value={createData?.endDate}
          onChange={(e) => handleOnChange(e)}
          className="w-full border border-gray-300 rounded-md px-2 py-3 mt-2"
          placeholder="End Date"
        />
        <div>
          <label className="text-gray-700 text-md">Market categories</label>
          <select
            name="category"
            value={createData?.category}
            onChange={(e) => handleOnChange(e)}
            className="w-full border border-gray-300 rounded-md px-2 py-3 mt-2"
          >
            <option value="null">Select Category</option>
            <option value="politics">Politics</option>
            <option value="entertainment">Entertainment</option>
            <option value="sports">Sports</option>
            <option value="social">Social</option>
          </select>
        </div>
      </div>
      {/* <div className="w-full mt-4">
        {" "}
        <div className="flex flex-col items-center justify-center p-6 bg-white text-white border-4 border-dotted w-full">
          <label className="cursor-pointer bg-violet-300  text-violet-600 py-2 px-4 rounded-lg mb-3 transition duration-300">
            Upload Post Image
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {fileName && <p className="text-gray-400 text-sm">{fileName}</p>}

          {image && (
            <div className="mt-4 w-full flex flex-col items-center">
              <Image
                src={image}
                alt="Uploaded Preview"
                className="w-[100%] h-[100%] object-cover rounded-lg border-2 border-gray-600 shadow-md"
                width={10}
                height={10}
              />
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                {uploadProgress}% Uploaded
              </p>
            </div>
          )}
        </div>
      </div> */}

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={changePreviousTab}
          className="text-gray-600 font-medium flex items-center space-x-1"
        >
          <span>← Previous</span>
        </button>
        <button
          onClick={changeNextTab}
          className="text-gray-600 font-medium flex items-center space-x-1"
        >
          <span>Next</span> →
        </button>
      </div>
    </>
  );
};
