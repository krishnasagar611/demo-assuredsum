import { appUrl } from "@/utils/axios-config";
import { yupResolver } from "@hookform/resolvers/yup";
import Cookies from "js-cookie";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react"; // Import useEffect
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import * as Yup from "yup";
import Button from "../Button";
import CustomeLoader from "../CustomeLoader";
import PageLoader from "../PageLoader";
import ContentSection from "../Title";

// Define your validation schema
const validationSchema = Yup.object().shape({
  loanRequirement: Yup.number()
    .typeError("Loan requirement must be a number")
    .required("Loan requirement is required"),
  employmentStatus: Yup.string().required("Employment status is required"),
  workExperience: Yup.number()
    .typeError("Work experience must be a number")
    .required("Work experience is required")
    .min(0, "Work experience cannot be negative")
    .max(20, "Work experience cannot exceed 20 years")
    .test("no-decimal", "Please enter a whole number", (value) => {
      if (value === undefined) return true;
      return Number.isInteger(value);
    }),
  monthlyIncome: Yup.string()
    .required("Monthly income is required")
    .matches(/^[a-zA-Z0-9\s]*$/, "Special characters not allowed")
    .matches(/^[^\s]+$/, "Spaces are not allowed")
    .matches(
      /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
      "Characters are not allowed"
    ),
  loanType: Yup.string().required("Loan type is required"),
  consent: Yup.bool().oneOf([true], "Consent is required"),
});

type SelectPanType = {
  nextStep: () => void;
  prevStep: () => void;
};

type Inputs = {
  loanRequirement: number;
  employmentStatus: string;
  workExperience: string;
  monthlyIncome: number;
  loanType: string;
  consent: boolean;
};

export default function SelectPan({
  nextStep,
  prevStep,
  formData,
  setFormData,
}: SelectPanType & { formData: any; setFormData: (data: any) => void }) {
  const storedFormData = JSON.parse(localStorage.getItem("formData") || "{}");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [filledFields, setFilledFields] = useState({
    loanRequirement: false,
    employmentStatus: false,
    workExperience: false,
    monthlyIncome: false,
    loanType: false,
    consent: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    //@ts-ignore
  } = useForm<Inputs>({
    //@ts-ignore
    resolver: yupResolver(validationSchema),
    defaultValues: {
      //@ts-ignore
      loanRequirement: "",
      employmentStatus: "",
      workExperience: "",
      //@ts-ignore
      monthlyIncome: "",
      loanType: "",
    },
  });
  const submitForm = async (data: Inputs) => {
    const token = Cookies.get("authToken");
    if (!token) {
      console.error("No auth token found");
      toast.error("Authentication error. Please log in again.");
      return null;
    }

    try {
      const response = await fetch(`${appUrl}/submitForm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
      return null;
    }
  };

  const fetchUserData = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      console.error("No auth token found");
      return null;
    }

    try {
      const response = await fetch(`${appUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      return result; // Return the entire result, not result.data
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);

      try {
        const userData = await fetchUserData();
        console.log("Fetched user data:", userData);

        if (userData && userData?.user) {
          const newFilledFields = { ...filledFields };

          if (userData?.user?.loanRequirement) {
            setValue("loanRequirement", userData.user.loanRequirement);
            newFilledFields.loanRequirement = true;
          }
          if (userData?.user?.employmentStatus) {
            setValue("employmentStatus", userData.user.employmentStatus);
            newFilledFields.employmentStatus = true;
          }
          if (userData?.user?.workExperience) {
            setValue("workExperience", userData.user.workExperience);
            newFilledFields.workExperience = true;
          }
          if (userData?.user?.monthlyIncome) {
            setValue("monthlyIncome", userData.user.monthlyIncome);
            newFilledFields.monthlyIncome = true;
          }
          if (userData?.user?.loanType) {
            setValue("loanType", userData.user.loanType);
            newFilledFields.loanType = true;
          }
          setValue("consent", userData?.user?.consent || false);

          setFilledFields(newFilledFields);
        } else {
          console.log("No user data found or user data is incomplete");
        }
      } catch (error) {
        console.error("Error in loadUserData:", error);
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data: any) => {
    const { loanRequirement, ...payload } = data;

    try {
      if (payload.monthlyIncome) {
        payload.monthlyIncome = parseFloat(payload.monthlyIncome);
      }
      if (payload.workExperience) {
        payload.workExperience = parseFloat(payload.workExperience);
      }

      setIsSubmitting(true);
      setFormData({ ...formData, ...data });
      const result = await submitForm(payload);
      if (result) {
        // toast.success("Form submitted successfully");
        nextStep();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    }
  };

  return (
    <main className="flex flex-col gap-6 h-full">
      <ContentSection
        title="We need a few more details to understand your Loan Requirements"
        //@ts-ignore
        para={
          <div className="flex items-center">
            Our team will verify your eligibility and provide you with the best
            offers for you
            <InfoIcon
              className="w-4 h-4 text-[#8E30A0] cursor-pointer ml-1 hover:text-[#8E30A0]"
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Please note: Once this information is submitted, it cannot be edited later. Ensure all details are accurate before proceeding."
            />
            <Tooltip
              id="my-tooltip"
              place="bottom"
              style={{ width: "25%" }}
              className="z-10"
            />
          </div>
        }
      />
      {isLoading ? (
        <PageLoader />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error("Form validation errors:", errors);
          })}
          className="flex flex-col justify-between h-full"
        >
          <div className="flex flex-col justify-between h-full">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Select Loan Type{" "}
                  <span className="text-red-700 font-bold">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center font-medium">
                    <input
                      type="radio"
                      value="newHomeLoan"
                      {...register("loanType")}
                      className="mr-2 border-gray-300 rounded h-4 w-4"
                      disabled={filledFields.loanType}
                    />
                    New Home Loan
                  </label>
                  <label className="flex items-center font-medium">
                    <input
                      type="radio"
                      value="transferHomeLoan"
                      {...register("loanType")}
                      className="mr-2 border-gray-300 rounded h-4 w-4"
                      disabled={filledFields.loanType}
                    />
                    Transfer Home Loan
                  </label>
                  <label className="flex items-center font-medium">
                    <input
                      type="radio"
                      value="PersonalLoan"
                      {...register("loanType")}
                      className="mr-2 border-gray-300 rounded h-4 w-4"
                      disabled={filledFields.loanType}
                    />
                    Personal Loan
                  </label>
                </div>
                <div className="min-h-[10px]">
                  {errors.loanType && (
                    <span className="text-red-700 text-xs">
                      {errors.loanType.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="loanRequirement"
                  className="block mb-2 text-sm font-medium text-gray-900 "
                >
                  Loan Requirement{" "}
                  <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  {...register("loanRequirement")}
                  type="text"
                  id="loanRequirement"
                  placeholder="Rs. 2,50,00,000"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  readOnly
                />
                <div className="min-h-[10px]">
                  {errors.loanRequirement && (
                    <span className="text-red-700 text-xs">
                      {errors.loanRequirement.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="employmentStatus"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Employment Status{" "}
                  <span className="text-red-700 font-bold">*</span>
                </label>
                <select
                  {...register("employmentStatus")}
                  id="employmentStatus"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-300 block w-full p-2.5"
                  disabled={filledFields.employmentStatus}
                >
                  <option value="">Select your employment status</option>
                  <option value="Employed">Employed</option>
                  <option value="SelfEmployed">Self Employed</option>
                  {/* <option value="Professional">Professional</option> */}
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Other">Other</option>
                </select>
                <div className="min-h-[10px]">
                  {errors.employmentStatus && (
                    <span className="text-red-700 text-xs">
                      {errors.employmentStatus.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="workExperience"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  {` Overall Work Experience (in Years)`}
                  <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  {...register("workExperience")}
                  type="text"
                  id="workExperience"
                  placeholder="Enter your work experience"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  readOnly={filledFields.workExperience}
                />
                <div className="min-h-[10px]">
                  {errors.workExperience && (
                    <span className="text-red-700 text-xs">
                      {errors.workExperience.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="monthlyIncome"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Monthly Income{" "}
                  <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  {...register("monthlyIncome")}
                  type="text"
                  id="monthlyIncome"
                  placeholder="Enter your monthly income"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  readOnly={filledFields.monthlyIncome}
                />
                <div className="min-h-[10px]">
                  {errors.monthlyIncome && (
                    <span className="text-red-700 text-xs">
                      {errors.monthlyIncome.message}
                    </span>
                  )}
                </div>
              </div>
            </section>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("consent")}
                id="consent"
                className="mr-2 h-3 w-3 text-blue-600"
                defaultChecked={watch("consent")}
                readOnly={filledFields.consent}
              />
              <p className="text-xs">
                I hereby authorize Assured Sum Financial Solutions to contact me
                to explain the product. I also agree to the{" "}
                <a
                  target="_blank"
                  className="underline text-blue-500 hover:text-blue-700 "
                  href="https://assuredsum.com/privacy-policy-2/"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  target="_blank"
                  className="underline text-blue-500 hover:text-blue-700"
                  href="https://assuredsum.com/terms-condition/"
                >
                  Terms and Conditions
                </a>
              </p>
            </div>
            <div className="min-h-[10px]">
              {errors.consent && (
                <span className="text-red-700 text-xs">
                  {errors.consent.message}
                </span>
              )}
            </div>
            <section className="flex mt-2 justify-between rounded-md w-full">
              <Button variant="ghost" onClick={prevStep}>
                Go Back
              </Button>
              <Button type="submit">
                {isSubmitting ? <CustomeLoader /> : "Next Step"}
              </Button>
            </section>
          </div>
        </form>
      )}
    </main>
  );
}
