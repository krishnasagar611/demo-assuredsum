"use client";

import Sidebar, { MobileSidebar } from "@/components/Sidebar";
import BasicInfo from "@/components/Steps/BasicInfo";
import FinishingUp from "@/components/Steps/FinishingUp";
import FormUploadWithTabs from "@/components/Steps/FormUploadWithTabs";
import SelectPan from "@/components/Steps/Requirements";
import SelectOffers from "@/components/Steps/SelectOffers";
import { appUrl } from "@/utils/axios-config";
import { getFromRouter, pushInRouter } from "@/utils/utils";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [activeStep, setActiveStep] = useState<any>(1);
  const [formData, setFormData] = useState<any>({});
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [areFieldsFilled, setAreFieldsFilled] = useState(false);
  const [user, setUser] = useState({});

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        return null;
      }

      const response = await axios.get(`${appUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.user;
      const coApplicants = response.data.coApplicants;
      const offers = response?.data?.hasOffers;
      setUser(userData);

      if (Array.isArray(offers) && offers?.length) {
        setActiveStep(5);
        pushInRouter("step", "5");
      }
      if (userData?.finalSubmit) {
        setActiveStep(4);
        pushInRouter("step", "4");
      }

      return {
        userData,
        hasCoApplicant: coApplicants && coApplicants.length > 0,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  function updateFieldsFilled(filled: boolean) {
    setAreFieldsFilled(filled);
  }
  useEffect(() => {
    const authToken = Cookies.get("authToken");
    setIsUserLoggedIn(!!authToken);
    checkFieldsFilled();
    const step = getFromRouter("step");
    if (authToken) {
      if (step && +step < 5) {
        setActiveStep(+step);
      }
      fetchUserData().catch(console.error);
    } else {
      pushInRouter("step", `1`);
    }
  }, [formData]);

  function checkFieldsFilled() {
    const requiredFields = {
      1: ["name", "email", "phoneNumber", "dob", "loanRequirement"],
      2: [
        "employmentStatus",
        "workExperience",
        "monthlyIncome",
        "loanType",
        "consent",
      ],
      3: ["pan", "aadhar", "form16", "bankStatement", "itr", "payslips"],
    };
    //@ts-ignore
    const currentStepFields = requiredFields[activeStep] || [];
    const filledFields = currentStepFields.filter(
      (field: any) => formData[field]
    );
    const allFilled = filledFields.length === currentStepFields.length;
    setAreFieldsFilled(allFilled);
  }

  function nextStep() {
    if (isUserLoggedIn || areFieldsFilled) {
      setActiveStep((prevStep: any) => {
        const step = prevStep + 1;
        pushInRouter("step", `${step}`);
        return step;
      });
    }
  }

  function prevStep() {
    setActiveStep((prevStep: any) => {
      const step = prevStep - 1;
      pushInRouter("step", `${step}`);
      return step;
    });
  }

  function setStep(step: number) {
    if (step <= activeStep || isUserLoggedIn || areFieldsFilled) {
      setActiveStep(step);
      pushInRouter("step", `${step}`);
    }
  }

  function RenderStep() {
    switch (activeStep) {
      case 1:
        return (
          <BasicInfo
            nextStep={async () => {
              await fetchUserData().catch(console.error);
              nextStep();
            }}
            setFormData={setFormData}
            setFieldsFilled={updateFieldsFilled}
          />
        );
      case 2:
        return (
          <SelectPan
            nextStep={nextStep}
            prevStep={prevStep}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return <FormUploadWithTabs nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return (
          <FinishingUp
            // setActiveStep={setStep}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );

      case 5:
        return (
          <SelectOffers
            setActiveStep={setStep}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex w-full bg-[#F5F4F9] md:items-center justify-center p-5 pt-32 md:pt-5">
      <MobileSidebar
        activeStep={activeStep}
        setActiveStep={setStep}
        excludeStep={[]}
      />
      <main className="bg-[#FFFFFF] w-full max-w-[1300px] gap-6 relative p-4 rounded-2xl grid grid-cols-1 md:grid-cols-12">
        <aside className="col-span-1 md:col-span-3 ">
          <Sidebar
            activeStep={activeStep}
            setActiveStep={setStep}
            excludeStep={[1,2,3,4,5]}
          />
        </aside>
        <div className="col-span-1 md:col-span-9 pt-5">
          <RenderStep />
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{ className: "react-hot-toast" }}
      />
    </div>
  );
}
