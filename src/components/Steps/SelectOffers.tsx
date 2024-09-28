import { useState, useEffect } from "react";
import React from "react";
import Button from "../Button";
import FinalthankYou from "./FinalthankYou";
import CustomeLoader from "../CustomeLoader";
import axios from "axios";
import Cookies from "js-cookie";
import { SetStateAction } from "jotai";
import { LoaderCircle } from "lucide-react";
import PageLoader from "../PageLoader";

type Props = {
  prevStep: () => void;
  setActiveStep: React.Dispatch<SetStateAction<any>>;
  nextStep: () => void;
};

type BankOffer = {
  _id: string;
  bankId: string;
  bankName: string;
  bankImage: string;
  interestRate: number;
  processingFees: number;
  prePaymentCharges: number;
  loanId: string;
  isSelectedByUser: boolean;
};

type LoanOfferCardProps = {
  bank: BankOffer;
  isSelected: boolean;
  onSelect: () => void;
};

const LoanOfferCard = ({ bank, isSelected, onSelect }: LoanOfferCardProps) => {
  const bankImageUrl = `https://assuredsum.com/admin/uploads/banks/${bank.bankImage}`;

  return (
    <div
      className={`border rounded-lg p-4 shadow-lg flex flex-col items-center hover:bg-gray-50 relative transition-all duration-500 hover:translate-y-2 ${
        isSelected ? "border-purple-700 font-bold bg-gray-100" : ""
      }`}
    >
      <img
        src={bankImageUrl}
        alt={`${bank.bankName} logo`}
        className="mb-4 w-24 h-12 object-contain"
      />
      <div className="text-center mb-4">
        <p className="font-bold">{bank.bankName}</p>
        <p>Req. Loan Amount</p>
        <p className="font-bold">4 Cr</p>
      </div>
      <div className="text-center mb-4">
        <p>Processing Fees</p>
        <p className="font-bold">₹{bank.processingFees}</p>
      </div>
      <div className="text-center mb-4">
        <p>Interest Rate</p>
        <p className="font-bold">{bank.interestRate}%</p>
      </div>
      <div className="text-center mb-4">
        <p>Pre Payment Charges</p>
        <p className="font-bold">{bank.prePaymentCharges}%</p>
      </div>
      <Button
        className={` ${isSelected ? "bg-blue-500" : "bg-[#8E30A0]"}`}
        onClick={onSelect}
      >
        {isSelected ? "Selected" : "Select"}
      </Button>
    </div>
  );
};

function SelectOffers({ prevStep, setActiveStep, nextStep }: Props) {
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL =
    "https://api-dev.assuredsum.com/api/v1/getMyBankApplication";
  const CHOOSE_BANK_API_URL =
    "https://api-dev.assuredsum.com/api/v1/chooseBankAccountForApplication";

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
        setBankOffers(response.data);

        const selectedBank = response.data.find(
          (bank: BankOffer) => bank.isSelectedByUser
        );
        if (selectedBank) {
          setSelectedLoan(selectedBank._id);
        }
      } catch (error) {
        console.error("Error fetching bank offers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankOffers();
  }, []);

  const handleSelect = (bankId: string) => {
    setSelectedLoan(bankId);
  };

  const handleNext = async () => {
    if (selectedLoan) {
      setIsSubmitting(true);
      try {
        const token = Cookies.get("authToken");
        await axios.get(`${CHOOSE_BANK_API_URL}/${selectedLoan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBankOffers((prevOffers) =>
          prevOffers.map((offer) =>
            offer._id === selectedLoan
              ? { ...offer, isSelectedByUser: true }
              : offer
          )
        );
      } catch (error) {
        console.error("Error submitting selected bank:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const selectedBank = bankOffers.find((bank) => bank.isSelectedByUser);

  if (selectedBank) {
    return <FinalthankYou />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">🎉 Hooray!</h1>
        <p className="text-lg mt-4">
          We have reviewed your Home Loan Application, and based on your
          eligibility, here are the best matches:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {bankOffers.map((bank) => (
          <LoanOfferCard
            key={bank._id}
            bank={bank}
            isSelected={selectedLoan === bank._id}
            onSelect={() => handleSelect(bank._id)}
          />
        ))}
      </div>
      <section className="flex justify-between rounded-md w-full">
        <Button variant="ghost" onClick={prevStep}>
          Go Back
        </Button>
        <Button
        
          className="bg-[#8E30A0]"
          onClick={handleNext}
           //@ts-ignore
          disabled={!selectedLoan || isSubmitting}
        >
          {isSubmitting ? <CustomeLoader /> : "Submit"}
        </Button>
      </section>
    </div>
  );
}

export default SelectOffers;
