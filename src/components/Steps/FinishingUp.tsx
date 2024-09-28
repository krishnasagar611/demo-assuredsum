/** @format */
"use client";
import thankYouImg from "@/assets/images/icon-thank-you.svg";
import { appUrl } from "@/utils/axios-config";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import router for navigation
import { useEffect, useState } from "react";
import Button from "../Button";
import ContentSection from "../Title";
import PageLoader from "../PageLoader";

type Props = {
  prevStep: () => void;
  nextStep: () => void;
};

const API_BASE_URL = `${appUrl}/getMyBankApplication`;

export default function FinishingUp({ prevStep, nextStep }: Props) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [user, setUser] = useState({});
  const [isFinalSubmitLoading, setIsFinalSubmitLoading] = useState(false);
  const getAuthToken = (): string | undefined => {
    const token = Cookies.get("authToken");
    if (!token) {
      // If the token is missing, redirect to the login page
      router.push("/auth/log-in");
      return undefined;
    }
    return token;
  };

  const finalSubmit = async () => {
    setIsFinalSubmitLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      await axios.post(
        `${appUrl}/finalSubmitForm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
    } finally {
      fetchUserData();
      checkBankApplication();
      setIsFinalSubmitLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        router.push("/auth/log-in");
        return null;
      }

      const response = await axios.get(`${appUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.user;
      const coApplicants = response.data.coApplicants;

      setUser(userData);

      return {
        userData,
        hasCoApplicant: coApplicants && coApplicants.length > 0,
      };
    } catch (error) {
      if (error?.status === 401) {
        setTimeout(() => {
          router.push("/auth/log-in");
        }, 3000);
      }
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check the API response
  const checkBankApplication = async () => {
    const token = getAuthToken(); // Get the token
    if (!token) return; // Exit if no token

    try {
      // Fetch API data with token in Authorization header
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token here
        },
      });

      const data = await response.json();

      // Check if the response is empty
      if (data && data.length > 0) {
        setIsNextEnabled(true); // Enable the "Next Step" button
      } else {
        setIsNextEnabled(false); // Disable the "Next Step" button
      }
    } catch (error) {
      console.error("Error fetching bank application data:", error);
      setIsNextEnabled(false); // Disable the button on error
    }
  };

  useEffect(() => {
    fetchUserData();
    checkBankApplication();
  }, []);

  const handleSubmit = () => {
    if (isNextEnabled) {
      nextStep();
    }
  };

  const isFinalSubmit = user?.finalSubmit;

  if(isLoading)
    return <PageLoader/>

  return (
    <div className="flex justify-start flex-col gap-10 h-full">
      <ContentSection title="" para="" />
      <div className="flex text-center items-center justify-center flex-col gap-4 h-full p-5 md:p-0">
        {isFinalSubmit && (
          <>
            {" "}
            <Image src={thankYouImg} alt="thank-you-img" />
            <h3 className="text-marine-blue font-bold text-2xl">
              Thank you for submitting your request!
            </h3>
            <p className="text-gray-500 font-medium">
              {`Our Expert is now reviewing your application. We'll keep you updated every step of the way. Stay tuned!`}
            </p>
          </>
        )}
        {!isFinalSubmit && (
          <>
            <Image src={thankYouImg} alt="thank-you-img" />
            <h3 className="text-marine-blue font-bold text-2xl">
              Thank you for submitting your application!
            </h3>
            <p className="text-gray-500 font-medium">
              Please take a moment to carefully review your application details
              before final submission. Ensure all provided information is
              accurate. Once submitted, no further changes can be made. If
              everything looks good, go ahead and finalize your submission.
              We’ll notify you about the next steps once your application is
              under review.
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col justify-between">
        <section className="flex mt-2 justify-between rounded-md w-full">
          <Button variant="ghost" onClick={prevStep}>
            Review Docs
          </Button>
          {isFinalSubmit && isNextEnabled && (
            <Button
              onClick={handleSubmit}
              //@ts-ignore
              disabled={!isNextEnabled || isLoading}
              className={`${
                !isNextEnabled || isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              } text-white font-bold py-2 px-4 rounded`}
            >
              {"Check Offers"}
            </Button>
          )}
          {!isFinalSubmit && (
            <Button
              onClick={finalSubmit}
              //@ts-ignore
              disabled={isFinalSubmitLoading}
              className={`${
                isFinalSubmitLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              } text-white font-bold py-2 px-4 rounded`}
            >
              {isFinalSubmitLoading ? "Submitting..." : "Final Submit"}
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
