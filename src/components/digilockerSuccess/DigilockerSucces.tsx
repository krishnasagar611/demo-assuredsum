"use client";
import { appUrl } from "@/utils/axios-config";
import { getFromRouter } from "@/utils/utils";
import { useEffect, useState } from "react";
import Lottie from "react-lottie-player";
import animationData from "../../../public/lottiefiles/Animation - 1727156458702.json";
import loadingAnimation from "../../../public/lottiefiles/loading-amination.json";

type Props = {};

function DigilockerSuccess({}: Props) {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleVerify = async () => {
    setLoading(true);

    const requestId = getFromRouter("requestId");
    const scope = getFromRouter("scope");
    const status = getFromRouter("status");
    const userId = getFromRouter("userId");

    if (requestId && scope && status === "success") {
      setLoading(true);
      try {
        const response = await fetch(`${appUrl}/fetchDigilockerFiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            scope,
            userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API response:", data);
          //@ts-ignore
          setVerificationStatus("success");
        } else {
          console.error("Failed to fetch Digilocker files");
          //@ts-ignore
          setVerificationStatus("error");
        }
      } catch (error) {
        console.error("Error making API call:", error);
        //@ts-ignore
        setVerificationStatus("error");
      } finally {
        setLoading(false);
      }
    } else {
      //@ts-ignore
      setVerificationStatus("error");
      setLoading(false);
    }
  };
  useEffect(() => {
    handleVerify().then(() => setTimeout(() => window.close(), 3000));
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          {verificationStatus === null && (
            <div className="flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4 flex justify-center items-center">
                <Lottie
                  loop
                  animationData={loadingAnimation}
                  play
                  style={{ width: 150, height: 150 }}
                />
                <span>Validating...</span>
              </h2>
              <p className="text-xs">
                Please wait while we are validating your KYC
              </p>
            </div>
          )}
          {verificationStatus === "success" && (
            <>
              <Lottie
                loop
                animationData={animationData}
                play
                style={{ width: 150, height: 150 }}
              />
              <p className="text-green-600 mb-4">Verification successful!</p>
            </>
          )}
          {verificationStatus === "error" && (
            <p className="text-red-600 mb-4">
              Verification failed. Please try again.
            </p>
          )}
          {!loading && <p>Redirecting in 3 sec...</p>}
        </div>
      </div>
    </div>
  );
}

export default DigilockerSuccess;
