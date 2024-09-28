import React, { useState, useEffect } from "react";
import { RiChatUploadFill } from "react-icons/ri";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const DigiLockerComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getAuthToken = () => {
    const token = Cookies.get("authToken");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      // Redirect to login page if needed
      // router.push("/auth/log-in");
      return null;
    }
    return token;
  };

  // Function to handle the DigiLocker request and redirect
  const handleDigiLocker = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        "https://api-dev.assuredsum.com/api/v1/digilockerUrl",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.result && response.data.result.url) {
        const url = response.data.result.url;
        window.location.replace(url); // Redirect user to DigiLocker
      } else {
        toast.error("Failed to get DigiLocker URL. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching DigiLocker URL:", error);
      toast.error(
        "An error occurred while fetching DigiLocker URL. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the incoming postMessage from DigiLocker
  const handleDigiLockerMessage = async (event: any) => {
    if (event.data.type === "DIGILOCKER_SUCCESS") {
      const { requestId, scope } = event.data;

      try {
        const token = getAuthToken();
        if (!token) return;

        const fetchResponse = await axios.post(
          "https://api-dev.assuredsum.com/api/v1/fetchDigilockerFiles",
          { requestId, scope },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (fetchResponse.data && fetchResponse.data.success) {
          toast.success("DigiLocker files fetched successfully!");
        } else {
          toast.error("Failed to fetch DigiLocker files. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching DigiLocker files:", error);
        toast.error(
          "An error occurred while fetching DigiLocker files. Please try again."
        );
      }
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleDigiLockerMessage);
    return () => {
      window.removeEventListener("message", handleDigiLockerMessage);
    };
  }, []);

  return (
    <>
      <button
        onClick={handleDigiLocker}
        className="bg-[#8E30A0] text-white py-2 px-20 rounded flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          </>
        ) : (
          "Download"
        )}
      </button>
    </>
  );

  return (
    <div className="flex items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-300 p-6">
      <div className="flex flex-col items-center justify-center">
        <RiChatUploadFill className="text-4xl text-[#8E30A0] mb-2" />
        <label className="block text-gray-700 font-medium mb-2">
          Complete KYC From DigiLocker
        </label>
        <button
          onClick={handleDigiLocker}
          className="bg-[#8E30A0] text-white py-2 px-20 rounded flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            </>
          ) : (
            "Download"
          )}
        </button>
      </div>
    </div>
  );
};

export default DigiLockerComponent;
