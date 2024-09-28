import { appUrl } from "@/utils/axios-config";
import Cookies from "js-cookie";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import PageLoader from "../PageLoader";

const ProgressStep = ({
  number,
  title,
  subtitle,
  isComplete,
  isActive,
  isRejected,
}: {
  number: number;
  title: string;
  subtitle?: string;
  isComplete?: boolean;
  isActive?: boolean;
  isRejected?: boolean;
}) => (
  <div className="flex flex-col items-center">
    <div className="relative mb-2">
      {isComplete ? (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
      ) : (
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isActive
              ? isRejected
                ? "bg-red-500 text-white"
                : "bg-[#8E30A0] text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {number}
        </div>
      )}
      {number < 5 && (
        <div className="absolute top-1/2 left-full w-full h-0.5 bg-gray-300 -translate-y-1/2"></div>
      )}
    </div>
    <div className="text-center max-w-[120px]">
      <h3
        className={`font-semibold text-sm ${
          isActive
            ? isRejected
              ? "text-red-500"
              : "text-[#8E30A0]"
            : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {isComplete && <p className="text-xs text-green-500 mt-1">Complete</p>}
      {isRejected && <p className="text-xs text-red-500 mt-1"></p>}
    </div>
  </div>
);

const ProgressSteps = () => {
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false); // Track rejection

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = Cookies.get("authToken");
      try {
        const response = await fetch(`${appUrl}/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUserData(data.user);
        determineCurrentStep(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const determineCurrentStep = (user: any) => {
    if (!user) return;

    if (user.activeStatus === "Rejected") {
      setIsRejected(true); // Set rejection state
      setCurrentStep(5); // Set to final step
    } else if (user.finalSubmit) {
      setCurrentStep(5); // Select offers
    } else if (user.activeStatus === "In Progress") {
      setCurrentStep(4); // Verification
    } else if (Object.keys(user.documents || {}).length === 0) {
      setCurrentStep(3); // Upload documents
    } else if (user.loanRequirement && user.employmentStatus) {
      setCurrentStep(2); // Requirements complete
    } else {
      setCurrentStep(1); // Basic Info
    }
  };

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Requirements" },
    { number: 3, title: "Upload documents" },
    { number: 4, title: "Verification" },
    {
      number: 5,
      title: isRejected ? "Application Rejected" : "Select offers",
    },
  ];

  if (isLoading) {
    return (
      <>
        <PageLoader />
      </>
    );
  }

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <ProgressStep
            key={step.number}
            number={step.number}
            title={step.title}
            isComplete={step.number < currentStep}
            isActive={step.number === currentStep}
            isRejected={isRejected && step.number === 5}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
