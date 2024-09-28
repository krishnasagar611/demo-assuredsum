"use client";
import CustomeLoader from "@/components/CustomeLoader";
import { appUrl } from "@/utils/axios-config";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import * as yup from "yup";

const phoneSchema = yup.object().shape({
  phoneNo: yup
    .string()
    .required("Mobile Number is required")
    .matches(/^[a-zA-Z0-9\s]*$/, "Special characters not allowed")
    .matches(
      /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
      "Characters are not allowed"
    )
    .matches(/^[6-9][0-9]*$/, "First number must be between 6 to 9")
    .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits"),
});

const otpSchema = yup.object().shape({
  otp: yup.string().required("OTP is required"),
});

type PhoneFormData = {
  phoneNo: string;
};

type OtpFormData = {
  otp: string;
};

const Page = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const router = useRouter();
  const csrfTokenFetched = useRef(false);

  const phoneForm = useForm<PhoneFormData>({
    resolver: yupResolver(phoneSchema),
    mode: "onChange",
  });

  const otpForm = useForm<OtpFormData>({
    resolver: yupResolver(otpSchema),
  });

  // const fetchCsrfToken = useCallback(async () => {
  //   if (csrfTokenFetched.current) return csrfToken;

  //   try {
  //     const response = await axios.get(
  //       "https://api-dev.assuredsum.com/session"
  //     );
  //     const newToken = response.data.csrfToken;
  //     setCsrfToken(newToken);
  //     csrfTokenFetched.current = true;
  //     console.log("CSRF Token fetched:", newToken);
  //     return newToken;
  //   } catch (error) {
  //     console.error("Error fetching CSRF token:", error);
  //     toast.error("Failed to fetch CSRF token. Please try again.");
  //     return "";
  //   }
  // }, []);
  // const getCSRFToken = useCallback(async () => {
  //   if (!csrfToken) {
  //     return await fetchCsrfToken();
  //   }
  //   return csrfToken;
  // }, [csrfToken, fetchCsrfToken]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const onSubmitPhone = async (data: PhoneFormData) => {
    setIsLoading(true);
    // const token = await getCSRFToken();
    try {
      const response = await axios.post(
        `${appUrl}/login`,
        {
          phoneNumber: data.phoneNo,
          // isDev: true,
        }
        // {
        //   headers: {
        //     "CSRF-Token": token,
        //   },
        // }
      );
      if (response.data.otpSent) {
        toast.success("OTP sent successfully!");
        setPhoneNumber(data.phoneNo);
        setIsOtpSent(true);
        setTimer(60);
        phoneForm.reset();
        setIsResendDisabled(true);
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("We couldn't find your account. Please register.");
      console.error("Error sending OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${appUrl}/verifyOtp`, {
        phoneNumber,
        otp: data.otp,
      });
      console.log(response, "responseresponse")

      if (
        response.data.success &&
        response.data.data.userVerified &&
        response.data.data.token
      ) {
        // Save the token in a cookie
        Cookies.set("authToken", response.data.data.token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });

        toast.success("OTP verified successfully!");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Incorect OTP. Please try again.");
      console.error("Error verifying OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${appUrl}/reSendOtp`,
        {
          phoneNumber: phoneNumber,
          // isDev: true,
        }
        // {
        //   headers: {
        //     "CSRF-Token": csrfToken,
        //   },
        // }
      );
      if (response.data.success) {
        toast.success("OTP resent successfully!");
        setTimer(60);
        setIsResendDisabled(true);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
      console.error("Error resending OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsOtpSent(false);
    setPhoneNumber("");
    phoneForm.reset();
  };

  return (
    <div className="lg:min-h-screen md:min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-20 bg-white shadow rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 min-h-[600px] items-center flex flex-col justify-center">
          <div className="flex flex-col items-center">
            <Link className="cursor-pointer" href="/">
              <img
                src="/images/assured-sumLogo.png"
                alt="Assured Sum"
                className="h-14 w-auto"
              />
            </Link>
          </div>
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Sign in to <span className="text-[#794AA0]">Assured Sum</span>
            </h1>
            <div className="w-full flex-1 mt-8">
              {!isOtpSent ? (
                <form
                  onSubmit={phoneForm.handleSubmit(onSubmitPhone)}
                  className="mx-auto max-w-xs"
                >
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="text"
                    placeholder="Mobile Number"
                    {...phoneForm.register("phoneNo")}
                  />
                  {phoneForm.formState.errors.phoneNo && (
                    <p className="text-red-500 text-sm mt-1">
                      {phoneForm.formState.errors.phoneNo.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-[#8E30A0] hover:bg-marine-blue text-gray-100 w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                    disabled={isLoading}
                  >
                    <span className="ml-3">
                      {isLoading ? <CustomeLoader /> : "Send OTP"}
                    </span>
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={otpForm.handleSubmit(onSubmitOtp)}
                  className="mx-auto max-w-xs"
                >
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="text"
                    placeholder="OTP"
                    {...otpForm.register("otp")}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-red-500 text-sm mt-1">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-[#8E30A0] hover:bg-marine-blue text-gray-100 w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                    disabled={isLoading}
                  >
                    <span className="ml-3">
                      {isLoading ? <CustomeLoader /> : "Verify OTP"}
                    </span>
                  </button>
                  <div className="mt-4 text-center flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-blue-500 hover:text-blue-700 underline text-sm"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResendDisabled}
                      className={`text-sm ${
                        isResendDisabled
                          ? "text-gray-400 text-sm"
                          : "text-blue-500 hover:text-blue-700 underline text-sm"
                      }`}
                    >
                      Resend OTP {isResendDisabled && `(${timer}s)`}
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="mt-4 text-center flex items-center justify-between gap-2 font-medium">
              {`Don't have an account?`}
              <Link
                href="/"
                className="text-[#8E30A0] hover:underline hover:[#8E30A0] font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
      <Toaster
        position={"top-right"}
        toastOptions={{ className: "react-hot-toast" }}
      />
    </div>
  );
};

export default Page;
