import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie"; 
import axios from "axios"; 
import PageLoader from "../PageLoader";

type BankOffer = {
  _id: string;
  bankName: string;
  bankImage: string;
  isSelectedByUser: boolean;
};

export default function FinalThankYou() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBankName, setSelectedBankName] = useState<string | null>(null);
  const API_BASE_URL =
    "https://api-dev.assuredsum.com/api/v1/getMyBankApplication";

  useEffect(() => {
    const fetchBankOffers = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get("authToken"); 
        const response = await axios.get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const selectedBank = response.data.find(
          (bank: BankOffer) => bank.isSelectedByUser
        );

        if (selectedBank) {
          setSelectedBankName(selectedBank.bankName); 
        }
      } catch (error) {
        console.error("Error fetching bank offers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankOffers();
  }, []);

  return (
    <>
      {isLoading ? (
        <PageLoader /> 
      ) : (
        selectedBankName && (
          <div className="bg-white overflow-hidden mx-auto grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-2xl font-bold mb-4">Congratulations!</h1>
              <h2 className="text-3xl font-bold text-black mb-2">
                You have selected{" "}
                <span className="text-pink-500">{selectedBankName}</span> for
                your Home Loan
              </h2>
              <p className="text-gray-500 mb-8">
                Our representative will connect with you shortly to assist with
                the processing of your loan application.
              </p>
              <Link
                href="/track-application"
                className=" bg-[#8E30A0] text-white py-2 px-4 rounded items-center justify-center flex"
              >
                Check Application Status
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/loan_finalsubmision.jpg"
                alt="Illustration"
                width={500}
                height={500}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        )
      )}
    </>
  );
}
