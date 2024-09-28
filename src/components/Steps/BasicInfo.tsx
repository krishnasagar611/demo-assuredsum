"use client";

import { ApiCalls } from "@/utils/api-calls";
import { appUrl } from "@/utils/axios-config";
import { cn } from "@/utils/cn";
import {
  convertToIndianWords,
  formatInIndianSystem,
} from "@/utils/numberFormater";
import { convertToDateInstance } from "@/utils/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Dialog from "@radix-ui/react-dialog";
import Cookies from "js-cookie";
import { CalendarIcon, InfoIcon, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SubmitHandler, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import * as Yup from "yup";
import Button from "../Button";
import PageLoader from "../PageLoader";
import ContentSection from "../Title";
import FormUploadWithTabs from "./FormUploadWithTabs";

type Props = {
  nextStep: () => void;
  setFormData: (data: any) => void;
  setFieldsFilled: (filled: boolean) => void;
};

type Inputs = {
  name: string;
  email: string;
  phoneNumber: string;
  dob: Date;
  loanRequirement: number;
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^\d]+$/, "Name cannot contain numbers")
    .matches(/^[a-zA-Z0-9\s]*$/, "Special characters not allowed")
    .test(
      "no-multiple-spaces",
      "Double space are not allowed",
      // @ts-ignore
      (value) => value && !/\s{2,}/.test(value)
    )
    .test(
      "no-leading-space",
      "Empty space at is not allowed",
      // @ts-ignore
      (value) => value && value.trimLeft() === value
    )
    .min(3, "Name must be at least 3 characters")
    .matches(/^(?! )(?=.*[^ ]).{3,}(?<! )$/, "Enter valid name")
    .max(75, "Name cannot exceed 75 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address")
    .matches(
      /^[^\s@]+@[^\s@]+\.(com|in|co|org|net|edu|gov)$/,
      "Invalid email address"
    )
    .test(
      "no-leading-space",
      "Double space are not allowed",
      // @ts-ignore
      (value) => value && value.trimLeft() === value
    )
    .test(
      "no-multiple-spaces",
      "Double space are not allowed",
      // @ts-ignore
      (value) => value && !/\s{2,}/.test(value)
    ),
  phoneNumber: Yup.string()
    .required("Mobile Number is required")
    .matches(/^[a-zA-Z0-9\s]*$/, "Special characters not allowed")
    .matches(
      /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
      "Characters are not allowed"
    )
    .matches(/^[6-9][0-9]*$/, "First number must be between 6 to 9")
    .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits"),
  dob: Yup.date().required("Date of birth is required"),
  loanRequirement: Yup.number()
    .required("Loan requirement is required")
    .min(3000000, "Amount should be between 30 Lakhs and 15 Crores")
    .max(150000000, "Amount should be between 30 Lakhs and 15 Crores")
    .typeError("Loan requirement must be a number"),
});

export default function BasicInfo({
  nextStep,
  setFormData,
  setFieldsFilled,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    //@ts-ignore
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const [loanAmountInWords, setLoanAmountInWords] = useState<string>("");
  const [isOtpDialogOpen, setOtpDialogOpen] = useState<boolean>(false);
  const [isCreditScoreDialogOpen, setCreditScoreDialogOpen] =
    useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isUserLoggedInWithFilledFields, setIsUserLoggedInWithFilledFields] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isOtpDialogOpen && !canResend) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [isOtpDialogOpen, canResend]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const userData = await fetchUserData();
      if (userData && userData?.user) {
        setValue("name", userData?.user?.name);
        setValue("email", userData?.user?.emailAddress);
        setValue("phoneNumber", userData?.user?.phoneNumber);
        setValue("dob", convertToDateInstance(userData?.user?.dob));
        setValue("loanRequirement", Number(userData?.user?.loanRequirement));
        handleLoanRequirementChange(Number(userData?.user?.loanRequirement));
        setIsLoggedIn(true);
        setIsUserLoggedInWithFilledFields(true);
      } else {
        loadFormData();
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    loadData().catch(console.error);

    const handleBeforeUnload = () => {
      Cookies.remove("authToken");
      localStorage.removeItem("formData");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [setValue]);

  const fetchUserData = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      // console.error("No auth token found");
      return null;
    }

    try {
      // console.log("Fetching user data with token:", token);
      const response = await fetch(`${appUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("Response status:", response.status);
      // console.log("Response headers:", response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      // console.log("Raw response text:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        // console.error("Error parsing JSON:", e);
        return null;
      }

      // console.log("Parsed API response:", result);

      return result;
    } catch (error) {
      // console.error("Error fetching user data:", error);
      toast.error("Error fetching user data. Please try logging in again.");
      return null;
    }
  };

  const loadFormData = () => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        if (
          key === "name" ||
          key === "email" ||
          key === "phoneNumber" ||
          key === "dob" ||
          key === "loanRequirement"
        ) {
          setValue(
            key,
            key === "dob" ? new Date(parsedData[key]) : parsedData[key]
          );
        }
      });
      handleLoanRequirementChange(parsedData.loanRequirement);
    }
  };

  const handleLoanRequirementChange = (value: number) => {
    if (value >= 3000000 && value <= 150000000) {
      const formattedAmount = formatInIndianSystem(value);
      const amountInWords = convertToIndianWords(value);
      setLoanAmountInWords(` ${amountInWords} Rupees`);
    } else {
      setLoanAmountInWords("");
    }
  };
  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (isUserLoggedInWithFilledFields) {
      setFieldsFilled(true);
      nextStep();
      return;
    }

    try {
      const formattedDob = formatDate(data.dob);
      const user = {
        phoneNumber: data.phoneNumber,
        name: data.name,
        dob: formattedDob,
        email: data.email,
        loanRequirement: data.loanRequirement,
      };

      const [apiData, error] = await ApiCalls.createUser(user);

      if (apiData?.data?.success) {
        setOtpDialogOpen(true);
        setCanResend(false);
        setTimer(60);
        setOtpError(null);
        toast.success("OTP sent successfully!");
      } else {
        if (
          error?.response?.data?.message == "Already registered, please login"
        ) {
          toast.error(
            "This mobile number is already registered. Please Login.",
            {
              duration: 3000,
            }
          );
          setTimeout(() => {
            router.push("/auth/log-in");
          }, 3000);
        } else {
          toast.error("Failed to register, Please try after sometime");
        }
      }
    } catch (error) {
      toast.error("Failed to register, Please try after sometime");
    }
  };
  const verifyOtp = async () => {
    try {
      setOtpError(null);
      const otpData = {
        phoneNumber: watch("phoneNumber"),
        otp,
      };
      const [data, error] = await ApiCalls.verifyOtp(otpData);

      console.log(data, error, "data, errordata, error");

      const result = data?.data;
      // console.log("OTP verification response:", result);
      console.log(result, "0---");
      if (result.success && result.data.userVerified) {
        Cookies.set("authToken", result.data.token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });
        setOtpDialogOpen(false);
        toast.success("OTP verified successfully!");
        setOtpError(null);

        // Fetch and set user data after successful verification
        const userData = await fetchUserData();
        // console.log("User Data:", userData);
        if (userData && userData.user) {
          // Add error handling for each setValue call
          try {
            setValue("name", userData.user.name);
            setValue("email", userData.user.emailAddress);
            setValue("phoneNumber", userData.user.phoneNumber);

            // Parse the date properly
            setValue("dob", new Date(userData.user.dob));

            setValue("loanRequirement", Number(userData.user.loanRequirement));
            handleLoanRequirementChange(Number(userData.user.loanRequirement));

            const formData = {
              name: userData.user.name,
              email: userData.user.emailAddress,
              phoneNumber: userData.user.phoneNumber,
              dob: userData.user.dob,
              loanRequirement: Number(userData.user.loanRequirement),
            };
            setFormData(formData);
            setIsUserLoggedInWithFilledFields(true);
          } catch (error) {
            // console.error("Error setting form values:", error);
            toast.error("Error setting user data. Please try again.");
          }
        }

        // Open the credit score dialog after successful OTP verification
        setCreditScoreDialogOpen(true);
      } else {
        const errorMessage = result.message || "Invalid OTP";
        // console.error("OTP verification failed:", errorMessage);
        setOtpError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      // console.error("Error verifying OTP:", error);
      const errorMessage = "Invalid OTP";
      setOtpError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Add this helper function at the top of your file
  const parseDate = (dateString: any) => {
    // console.log("Parsing date:", dateString);
    // Assuming the date is in DD/MM/YYYY format
    const [day, month, year] = dateString.split("/");
    const parsedDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }
    return parsedDate;
  };

  const handleCreditScoreChoice = (checkCreditScore: boolean) => {
    setCreditScoreDialogOpen(false);
    if (checkCreditScore) {
      window.open("https://assuredsum.com/credit-score/", "_blank");
    } else {
      setFieldsFilled(true);
      nextStep();
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${appUrl}/reSendOtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: watch("phoneNumber"),
          // isDev: true,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("OTP resent successfully!");
        setCanResend(false);
        setTimer(60);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      // console.error("Error resending OTP:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 flex-col h-full">
      <div className="flex items-center justify-between">
        <ContentSection
          title="Basic info"
          //@ts-ignore
          para={
            <>
              <div className="flex items-center ">
                Unlock Top Home Loan Offers from 15+ Lenders
                <InfoIcon
                  className="w-4 h-4 text-[#8E30A0] cursor-pointer ml-1 hover:text-[#8E30A0]"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Please note: This information cannot be edited later. Kindly enter your Name, Date of Birth, and Phone Number as per your Aadhaar and PAN for KYC verification."
                />
                <Tooltip
                  id="my-tooltip"
                  place="bottom"
                  style={{ width: "25%" }}
                  className="z-10"
                />
              </div>
              <div>
                <p className="text-red-500 text-sm">
                  Note :{" "}
                  <span className="text-[13px]">
                    Enter Your Name and Mobile Number as per Aadhar
                  </span>
                </p>
              </div>
            </>
          }
        />
      </div>
      {isLoading ? (
        <PageLoader />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col justify-between"
        >
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Enter Your Name{" "}
                <span className="text-red-700 font-bold">*</span>
              </label>

              <input
                {...register("name")}
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full"
                placeholder="Enter your name"
                disabled={isUserLoggedInWithFilledFields}
              />
              <div className="min-h-[16px]">
                {errors.name && (
                  <span className="text-red-700 text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>
            <div className="">
              <label
                htmlFor="dob"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Date Of Birth <span className="text-red-700 font-bold">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E30A0] z-30" />

                <DatePicker
                  placeholderText="Enter your date of birth"
                  selected={watch("dob")}
                  onChange={(date) => date && setValue("dob", date)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-4 py-2.5"
                  dateFormat="dd/MM/yyyy"
                  wrapperClassName="w-full"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  disabled={isUserLoggedInWithFilledFields}
                  maxDate={new Date()}
                  minDate={new Date("01-01-1960")}
                />
              </div>
              <div className="min-h-[16px]">
                {errors.dob && (
                  <span className="text-red-700 text-xs">
                    {errors.dob.message}
                  </span>
                )}
              </div>
            </div>
            <div className="">
              <label className="block mb-2 text-sm text-gray-900 font-medium">
                Phone Number <span className="text-red-700 font-bold">*</span>
              </label>
              <input
                {...register("phoneNumber")}
                type="text"
                id="phonenumber"
                placeholder="Enter your phone number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                disabled={isUserLoggedInWithFilledFields}
              />
              <div className="min-h-[16px]">
                {errors.phoneNumber && (
                  <span className="text-red-700 text-xs">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>
            </div>
            <div className="">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Email <span className="text-red-700 font-bold">*</span>
              </label>
              <input
                {...register("email")}
                id="email"
                placeholder="Enter your email address"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                disabled={isUserLoggedInWithFilledFields}
              />
              <div className="min-h-[16px]">
                {errors.email && (
                  <span className="text-red-700 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>
            <div className="">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Loan Requirement{" "}
                <span className="text-red-700 font-bold">*</span>
              </label>
              <input
                {...register("loanRequirement", {
                  onChange: (e) =>
                    handleLoanRequirementChange(Number(e.target.value)),
                })}
                type="text"
                id="loanRequirement"
                placeholder="Enter your loan requirement (30L to 15Cr)"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                disabled={isUserLoggedInWithFilledFields}
              />
              <div className="">
                {errors.loanRequirement && (
                  <span className="text-red-700 text-xs">
                    {errors.loanRequirement.message}
                  </span>
                )}
              </div>
              <div className="text-gray-700 mt-2">
                {loanAmountInWords && (
                  <span className="text-sm">{loanAmountInWords}</span>
                )}
              </div>
            </div>
          </section>
          <div className="flex justify-end">
            <Button className="bg-[#8E30A0]">
              {isUserLoggedInWithFilledFields
                ? "Proceed to Next Step"
                : "Next Step"}
            </Button>
          </div>
        </form>
      )}

      <Dialog.Root open={isOtpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <Dialog.Overlay className={cn("fixed inset-0 bg-black/30")} />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 w-full max-w-md transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg"
          )}
        >
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Verify your Number
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            The One Time Password has been sent to Mobile No.
          </Dialog.Description>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
            }}
            placeholder="Enter OTP"
            className="mt-4 p-2 border border-gray-300 rounded w-full"
          />
          {otpError && (
            <span className="text-red-700 text-xs mt-2">{otpError}</span>
          )}
          <div className="mt-4 flex justify-between items-center">
            {canResend ? (
              <Button
                className="bg-gray-200"
                onClick={resendOtp}
                //@ts-ignore
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Resend OTP"
                )}
              </Button>
            ) : (
              <span className="text-sm text-red-600">Resend in {timer}s</span>
            )}
            <Button className="bg-[#8E30A0]" onClick={verifyOtp}>
              Verify
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={isCreditScoreDialogOpen}
        onOpenChange={setCreditScoreDialogOpen}
      >
        <Dialog.Overlay className={cn("fixed inset-0 bg-black/30")} />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 w-full max-w-md transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg"
          )}
        >
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Check Credit Score
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Would you like to check your credit score?
          </Dialog.Description>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="ghost"
              className="bg-gray-200 text-gray-800"
              onClick={() => handleCreditScoreChoice(false)}
            >
              No
            </Button>
            <Button
              className="bg-[#8E30A0]"
              onClick={() => handleCreditScoreChoice(true)}
            >
              Yes
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
      <Toaster
        position={"top-right"}
        toastOptions={{ className: "react-hot-toast" }}
      />
    </div>
  );
}
