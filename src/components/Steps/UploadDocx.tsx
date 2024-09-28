import { appUrl } from "@/utils/axios-config";
import axios from "axios";
import Cookies from "js-cookie";
import { BadgeCheck, InfoIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { Tooltip } from "react-tooltip";
import Button from "../Button";
import ContentSection from "../Title";
//@ts-ignore
import "@cyntler/react-doc-viewer/dist/index.css";
import PageLoader from "../PageLoader";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../../public/lottiefiles/loading-amination.json";

type Props = {
  readonly nextStep: () => void;
  readonly prevStep: () => void;
  readonly forPrimaryApplicant: boolean;
  readonly coApplicantId: string;
  readonly initialFiles: { [key: string]: FileState };
  readonly readonlyMode?: boolean;
  readonly needToShowCoApplicantModal: boolean;
  readonly refresh: () => any;
  readonly allErrors: any;
  readonly setApplicantErrors: any;
  readonly disableForm: boolean;
};

type FileState = {
  file: File | null;
  fileName: string | null;
  path: string | null;
};

type ErrorState = {
  [key: string]: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const API_BASE_URL = appUrl;

export enum DocPanel {
  KYC,
  ITR,
  FINANCE,
}

export default function UploadDocs({
  nextStep,
  prevStep,
  initialFiles,
  readonlyMode,
  coApplicantId,
  forPrimaryApplicant,
  needToShowCoApplicantModal,
  allErrors,
  refresh,
  setApplicantErrors,
  disableForm,
}: Props) {
  const [files, setFiles] = useState<{ [key: string]: FileState }>(
    initialFiles || {}
  );

  const [errors, setErrors] = useState<ErrorState>({});
  const [showAadharPopup, setShowAadharPopup] = useState(false);
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [fileUploadStatus, setFileUploadStatus] = useState<{
    [key: string]: boolean;
  }>({
    aadhar: false,
    pan: false,
    itr: false,
    form16: false,
    payslips: false,
    bankStatement: false,
  });
  const [showCoApplicantPopup, setShowCoApplicantPopup] = useState(false);
  const [showCoApplicantForm, setShowCoApplicantForm] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState<any>(false);
  const [showDeleteCoApplicantPopup, setShowDeleteCoApplicantPopup] =
    useState(false);
  const [isDigilockerOpen, setIsDigilockerOpen] = useState(false);
  const [isKycSubmitting, setIsKycSubmitting] = useState({
    pan: false,
    adhar: false,
  });
  const router = useRouter();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File size should be less than 5MB";
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Only PDF, JPEG, and PNG files are allowed";
    }
    return null;
  };

  const getAuthToken = (): string | undefined => {
    const token = Cookies.get("authToken");
    if (!token) {
      router.push("/auth/log-in");
      return undefined;
    }
    return token;
  };

  const getPresignedURL = async (
    fileName: string,
    fileType: string,
    token: string
  ) => {
    try {
      const [, fileExt] = fileName.split(".");

      const response = await axios.post(
        `${API_BASE_URL}/presignedURL`,
        { fileName, fileType, intent: "adhar", fileExt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting presigned URL:");
      if (axios.isAxiosError(error)) {
        console.error("Request config:", error.config);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const uploadToS3 = async (presignedURL: string, file: File) => {
    try {
      const response = await axios.put(presignedURL, file, {
        headers: { "Content-Type": file.type },
      });
      if (response.status !== 200) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    } catch (error: any) {
      console.error(
        "Error uploading to S3:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const extractPath = (url: string): string => {
    try {
      const urlObject = new URL(url);
      const fullPath = urlObject.pathname;
      const desiredPath = fullPath.substring(fullPath.indexOf("vendor"));
      return desiredPath;
    } catch (error) {
      console.error("Invalid URL:", error);
      return "";
    }
  };

  const handleFileChange =
    (fieldName: string) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        const error = validateFile(selectedFile);
        if (error) {
          setErrors((prev) => ({ ...prev, [fieldName]: error }));
          toast.error(error);
          return;
        }

        // Aadhar-specific validations
        if (fieldName === "aadhar") {
          // Check file type
          if (
            !["image/jpeg", "image/png", "application/pdf"].includes(
              selectedFile.type
            )
          ) {
            const errorMessage =
              "Please upload Aadhar card in JPEG, PNG, or PDF format.";
            setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
            toast.error(errorMessage);
            return;
          }

          if (selectedFile.size > 5 * 1024 * 1024) {
            const errorMessage =
              "Aadhar card file size should be less than 5MB.";
            setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
            toast.error(errorMessage);
            return;
          }
        }

        setIsUploading((prev) => ({ ...prev, [fieldName]: true }));
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));

        try {
          const authToken = getAuthToken();
          if (!authToken) {
            throw new Error("Authentication token not found");
          }

          const response = await getPresignedURL(
            selectedFile.name,
            selectedFile.type,
            authToken
          );

          if (!response || !response.data || !response.data.url) {
            throw new Error(
              "Failed to get presigned URL: URL not found in response"
            );
          }

          await uploadToS3(response.data.url, selectedFile);

          const extractedPath = extractPath(response.data.url);

          setFiles((prev) => ({
            ...prev,
            [fieldName]: {
              file: selectedFile,
              fileName: selectedFile.name,
              path: extractedPath,
            },
          }));

          setFileUploadStatus((prev) => ({ ...prev, [fieldName]: true }));

          if (fieldName === "aadhar" && extractedPath) {
            try {
              await validateAadhar(extractedPath);
              toast.success("Aadhar card validated successfully!");
            } catch (validationError) {
              console.error("Aadhar validation failed:", validationError);
              const errorMessage =
                "Aadhar validation failed. Please try again.";
              setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
              toast.error(errorMessage);
              return;
            }
          } else if (fieldName === "pan" && extractedPath) {
            try {
              await validatePan(extractedPath);
              toast.success("PAN card validated successfully!");
            } catch (validationError) {
              console.error("PAN validation failed:", validationError);
              const errorMessage = "PAN validation failed. Please try again.";
              setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
              toast.error(errorMessage);
              return;
            }
          } else {
            toast.success("File uploaded successfully!");
          }
        } catch (error: any) {
          console.error("Error in handleFileChange:", error);
          let errorMessage = "An unexpected error occurred";
          if (error.response) {
            errorMessage = `${error.response.status} - ${
              error.response.data.message || error.response.statusText
            }`;
          } else if (error.request) {
            errorMessage = "No response received from server";
          } else {
            errorMessage = error.message;
          }
          setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
          toast.error(errorMessage);
        } finally {
          setIsUploading((prev) => ({ ...prev, [fieldName]: false }));
        }
      }
    };

  const handleAadharUploadClick = () => {
    setShowAadharPopup(true);
  };

  const handleAadharPopupResponse = (response: boolean) => {
    setShowAadharPopup(false);
    if (response) {
      const fileInput = document.getElementById("file-aadhar");
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  const createCoApplicant = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/createCoApplicants`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting presigned URL:");
      if (axios.isAxiosError(error)) {
        console.error("Request config:", error.config);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const handleCoApplicantPopupResponse = async (response: boolean) => {
    setShowCoApplicantPopup(false);
    if (response) {
      setShowCoApplicantForm(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      const res = await createCoApplicant();

      const id = res?.data?._id;
      // @ts-ignore
      await refresh(id);
    } else {
      nextStep();
    }
  };

  const getAllCoApplicantsError = () => {
    if (!Array.isArray(allErrors)) return;
    return allErrors.map((d) => `${d?.name} is missing ${d?.errors?.join()}`);
  };

  const getAllCoApplicantsErrorExcept = () => {
    if (!Array.isArray(allErrors)) return;
    return allErrors
      .filter((d) => d?.id !== coApplicantId)
      .map((d) => `${d?.name} is missing ${d?.errors?.join()}`);
  };

  const handleSubmit = async () => {
    if(disableForm){
      nextStep();
      return
    }
    
    const newErrors: ErrorState = {};
    Object.entries(files).forEach(([key, value]) => {
      if (!value.file && !value.path) {
        newErrors[key] = "Please upload a file";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please upload all required documents.");
      return;
    }

    try {
      const token = Cookies.get("authToken");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        router.push("/auth/log-in");
        return;
      }
      //@ts-ignore
      const { userData, hasCoApplicant } = await fetchUserData();
      if (!userData) {
        toast.error("Failed to fetch user data. Please try again.");
        return;
      }

      // Prepare documents data
      const documents = {
        adhar: files.aadhar.path || "",
        pan: files.pan.path || "",
        payslips: [files.payslips.path || ""],
        form16: files.form16.path || "",
        itr: files.itr.path || "",
        bankStatement: files.bankStatement.path || "",
      };

      // Prepare data for submission
      const submitData = {
        loanType: userData.loanType || "PersonalLoan",
        consent: true,
        employmentStatus: userData.employmentStatus,
        workExperience: parseFloat(userData.workExperience) || 0,
        monthlyIncome: userData.monthlyIncome || 0,
        currentEMI: userData.currentEMI || 0,
        documents: documents,
      };

      //check if user is coApplicant
      if (!forPrimaryApplicant) {
        await axios.post(
          `${appUrl}/updateCoApplicant/${coApplicantId}`,
          { documents },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        await axios.post<{ message: string }>(
          `${appUrl}/submitForm`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setFileUploadStatus({
        aadhar: true,
        pan: true,
        itr: true,
        form16: true,
        payslips: true,
        bankStatement: true,
      });
      const e = getAllCoApplicantsErrorExcept();
      if (allErrors && Array.isArray(e) && e.length) {
        setApplicantErrors(true);
        e.forEach((d) => toast.error(d));
        return;
      }

      if (needToShowCoApplicantModal) {
        setShowCoApplicantPopup(true);
      } else {
        nextStep();
      }
      setDocumentsUploaded(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/auth/log-in");
        } else {
          toast.error(
            error.response?.data?.message ||
              "An error occurred while submitting the form. Please try again."
          );
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      setErrors({
        submit:
          "An error occurred while submitting the form. Please try again.",
      });
    }
  };

  const validateAadhar = async (aadharImageLink: string) => {
    setIsKycSubmitting((p) => ({ ...p, adhar: true }));
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const fullImageLink = `${aadharImageLink}`;

      //check for co applicant
      if (!forPrimaryApplicant) {
        const response = await axios.post(
          `${API_BASE_URL}/validateCoApplicantDoc`,
          {
            id: coApplicantId,
            docType: "ADHAR",
            assetLink: fullImageLink,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;
      }

      const response = await axios.post(
        `${API_BASE_URL}/validateAadhar`,
        { imageLink: fullImageLink },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      // console.error("Error validating Aadhar:", error);
    } finally {
      setIsKycSubmitting((p) => ({ ...p, adhar: false }));
    }
  };

  const validatePan = async (panImageLink: string) => {
    setIsKycSubmitting((p) => ({ ...p, pan: true }));

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const fullImageLink = `${panImageLink}`;

      //check if its a co applicant

      if (!forPrimaryApplicant) {
        const response = await axios.post(
          `${API_BASE_URL}/validateCoApplicantDoc`,
          {
            id: coApplicantId,
            docType: "PAN",
            assetLink: fullImageLink,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;
      }

      const response = await axios.post(
        `${API_BASE_URL}/validatePan`,
        { imageLink: fullImageLink },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error validating PAN:", error);
    } finally {
      setIsKycSubmitting((p) => ({ ...p, pan: false }));
    }
  };

  const handlePreview = (fieldName: string) => {
    const file = files[fieldName].file;
    const path = files[fieldName].path;

    if (file) {
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } else if (path) {
      const fileURL = path?.startsWith("http")
        ? path
        : `https://assets-dev.assuredsum.com${path}`;
      window.open(fileURL, "_blank");
    }
  };

  const truncateFileName = (fileName: any) => {
    if (typeof fileName !== "string") return "";

    const words = fileName?.split(" ");
    if (words.length > 2) {
      return words.slice(0, 2).join(" ") + "...";
    }
    return fileName;
  };

  const addRedAsterisk = (label: string) => (
    <span>
      {label.replace("*", "")}
      <span className="text-red-700 font-bold">*</span>
    </span>
  );
  const renderFileUpload = (
    fieldName: string,
    label: string,
    enableUploadButton = false
  ) => {
    const showUploadBadge =
      !fileUploadStatus[fieldName] &&
      !files[fieldName]?.file &&
      !files[fieldName]?.path &&
      !errors[fieldName];
    const reUpload = !!errors[fieldName];
    const isFileAvailable = !!(
      files[fieldName]?.file || files[fieldName]?.path
    );
    const isUploadingField = isUploading[fieldName];
    const uploadLabel = isUploadingField ? "Uploading..." : "Browse Files";
    const changeLabel = isUploadingField ? "Uploading..." : "Change File";
    const errorLabel = isUploadingField ? "Uploading..." : "Upload";

    const renderInput = () => (
      <input
        type="file"
        onChange={handleFileChange(fieldName)}
        className="hidden"
        id={`file-${fieldName}`}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    );

    const renderLabel = (labelText: string, className = "") => (
      <label
        htmlFor={fieldName !== "aadhar" ? `file-${fieldName}` : undefined}
        className={`${className} bg-[#8E30A0] text-white py-2 px-10 rounded cursor-pointer ${
          isUploadingField ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={fieldName === "aadhar" ? handleAadharUploadClick : undefined}
      >
        {labelText}
      </label>
    );

    return (
      <div className="flex flex-col items-center shadow-md rounded-lg p-6">
        {/* Upload/Preview Icons */}
        {isFileAvailable || fileUploadStatus[fieldName] ? (
          <FaEye className="text-4xl text-blue-500 hidden" />
        ) : (
          <IoCloudUploadOutline className="text-4xl text-[#8E30A0]" />
        )}

        {/* File Upload Label */}
        <label className="block text-gray-700 font-medium mb-2">
          {addRedAsterisk(label)}
        </label>

        {/* Upload Badge or File Re-upload */}
        {showUploadBadge && (
          <>
            {renderInput()}
            {renderLabel(uploadLabel)}
          </>
        )}

        {/* Display Filename or Success Icon */}
        {isFileAvailable && (
          <p className="mt-2 text-sm text-[#8E30A0] font-medium">
            {truncateFileName(files[fieldName]?.fileName) || (
              <BadgeCheck className="text-green-500" />
            )}
          </p>
        )}

        {/* Error Message */}
        {errors[fieldName] && (
          <p className="mt-2 text-sm text-red-600 truncate line-clamp-1">
            {errors[fieldName]}
          </p>
        )}

        {/* File Actions (View or Change) */}
        {isFileAvailable && (
          <div className="flex gap-4">
            <p
              className="mt-2 text-sm text-[#8E30A0] hover:underline cursor-pointer hover:text-[#8E30A0] flex items-center gap-1 justify-center"
              onClick={() => handlePreview(fieldName)}
            >
              View <FaEye className="text-[#8E30A0]" />
            </p>

            {enableUploadButton && (
              <>
                {renderInput()}
                {renderLabel(changeLabel, "mt-2 hover:underline")}
              </>
            )}
          </div>
        )}

        {/* Re-upload if errors exist */}
        {reUpload && (
          <>
            {renderInput()}
            {renderLabel(errorLabel, "bg-[#fc0022]")}
          </>
        )}
      </div>
    );
  };

  const deleteCoApplicant = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/deleteCoApplicant/${coApplicantId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Co Applicant Deleted Successfully");
    } catch (e) {
      toast.error("Unable to delete Co Applicant, At the moment");
      setShowDeleteCoApplicantPopup(false);
    } finally {
      setShowDeleteCoApplicantPopup(false);
       // @ts-ignore
      await refresh("account");
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

      if (userData.documents) {
        setFiles((prevFiles) => ({
          ...prevFiles,
          aadhar: { ...prevFiles.aadhar, path: userData.documents.adhar },
          pan: { ...prevFiles.pan, path: userData.documents.pan },
          itr: { ...prevFiles.itr, path: userData.documents.itr },
          form16: { ...prevFiles.form16, path: userData.documents.form16 },
          payslips: {
            ...prevFiles.payslips,
            path: Array.isArray(userData.documents.payslips)
              ? userData.documents.payslips[0]
              : userData.documents.payslips,
          },
          bankStatement: {
            ...prevFiles.bankStatement,
            path: userData.documents.bankStatement,
          },
        }));
      }

      // Set file upload status based on existing documents
      setFileUploadStatus({
        aadhar: !!userData.documents?.adhar,
        pan: !!userData.documents?.pan,
        itr: !!userData.documents?.itr,
        form16: !!userData.documents?.form16,
        payslips: !!userData.documents?.payslips,
        bankStatement: !!userData.documents?.bankStatement,
      });

      // Check if all required documents are uploaded
      const allDocumentsUploaded = Object.values(fileUploadStatus).every(
        (status) => status
      );
      setDocumentsUploaded(allDocumentsUploaded);

      return {
        userData,
        hasCoApplicant: coApplicants && coApplicants.length > 0,
      };
    } catch (error:any) {
      if (error?.status === 401) {
        setTimeout(() => {
          router.push("/auth/log-in");
        }, 3000);
      }
      console.error("Error fetching user data:", error);
    }
  };

  const getDigilockerUrl = async () => {
    try {
      let url = `${appUrl}/digilockerUrl`;
      if (coApplicantId) {
        url += `?coApplicantId=${coApplicantId}`;
      }
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (response.data && response.data.result && response.data.result.url) {
        return response.data.result.url;
      } else {
        toast.error("Failed to get DigiLocker URL. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching DigiLocker URL:", error);
      toast.error(
        "An error occurred while fetching DigiLocker URL. Please try again."
      );
      return null;
    }
  };

  const handleDigiLocker = async () => {
    setIsDigilockerOpen(true);

    // Try to open the popup window
    const url = await getDigilockerUrl();

    if (!url) return;

    const popup = window.open(url, "DigiLocker", "width=600,height=600");

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      // Popup blocked or failed to open
      toast.error("Popup failed to open. It may be blocked by the browser.");
      setIsDigilockerOpen(false);
      return;
    }

    // Check periodically if the popup is still open
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed); // Stop checking once the popup is closed
        setIsDigilockerOpen(false);
        console.log("DigiLocker popup has been closed.");
      }
    }, 1000 * 3);
  };

  const isKycDocsCompleted =
    initialFiles?.aadhar?.path && initialFiles?.pan?.path ? true : false;
  const isITRDocsCompleted =
    initialFiles?.itr?.path && initialFiles?.form16?.path ? true : false;

  return (
    <div className="flex gap-6 flex-col mt-5">
      {!(readonlyMode || forPrimaryApplicant) && (
        <ContentSection
          title="Upload Your Documents"
          //@ts-ignore
          para={Heading}
        />
      )}

      <div className="h-full flex flex-col justify-between ">
        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold dark:text-white mb-3">
            KYC Docs
          </h2>

          {!(readonlyMode || isKycDocsCompleted) && (
            <div className="flex mb-6">
              <p className="text-md text-gray-400 font-normal">
                Complete KYC using{" "}
                <span
                  className="w-4 h-4 text-[#8E30A0] cursor-pointer ml-1 hover:text-[#8E30A0] font-bold"
                  onClick={handleDigiLocker}
                >
                  Digilocker
                </span>
              </p>
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
              <div className="space-y-8 text-sm">
                {isKycSubmitting.adhar ? (
                  <div className="flex flex-col w-full h-full items-center justify-center">
                    <Lottie
                      loop
                      animationData={loadingAnimation}
                      play
                      style={{ width: 150, height: 150 }}
                    />
                  </div>
                ) : (
                  renderFileUpload("aadhar", "Aadhar Card*")
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
              <div className="space-y-8 text-sm">
                {isKycSubmitting.pan ? (
                  <div className="flex flex-col w-full h-full items-center justify-center">
                    <Lottie
                      loop
                      animationData={loadingAnimation}
                      play
                      style={{ width: 150, height: 150 }}
                    />
                  </div>
                ) : (
                  renderFileUpload("pan", "PAN Card*")
                )}
              </div>
            </div>
            <div></div>
          </section>
        </div>

        <div className="flex flex-col my-7">
          <h2 className="text-xl font-extrabold dark:text-white mb-3">
            ITR Documents
          </h2>
          {!(readonlyMode || isITRDocsCompleted) && (
            <p className="text-lg text-gray-400 font-normal mb-6">
             {` Don't have the document handy? fetch from`}
              <span className="w-4 h-4 text-[#8E30A0] cursor-pointer ml-1 hover:text-[#8E30A0] font-bold">
                ITR Portal
              </span>
            </p>
          )}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
              <div className="space-y-8 text-sm">
                {renderFileUpload(
                  "itr",
                  "Income Tax Return (Last 2 year)*",
                  !disableForm
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
              <div className="space-y-8 text-sm">
                {renderFileUpload(
                  "form16",
                  "26AS (Last 2 Year)*",
                  !disableForm
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold dark:text-white mb-3">
            Financial Documents
          </h2>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
              <div className="space-y-8 text-sm">
                {renderFileUpload(
                  "bankStatement",
                  "Upload your Bank Statements(Last 2 Years)*",
                  !disableForm
                )}{" "}
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
              <div className="space-y-8 text-sm">
                {renderFileUpload(
                  "payslips",
                  "Payslips (Last 6 Months)*",
                  !disableForm
                )}{" "}
              </div>
            </div>
          </section>
        </div>
      </div>
      {!forPrimaryApplicant && !disableForm && (
        <p className="flex font-bold text-gray-700">
          Delete this Co Applicant{" "}
          <span>
            <button
              className={`bg-red-500 py-1 px-2 rounded-lg mx-2 `}
              onClick={() => setShowDeleteCoApplicantPopup(true)}
              disabled={disableForm}
            >
              <TrashIcon className="text-white" />
            </button>
          </span>{" "}
        </p>
      )}
      <b className="text-red-600">
        {getAllCoApplicantsErrorExcept() ?? getAllCoApplicantsErrorExcept()}
      </b>
      <section className="flex mt-2 justify-between rounded-md w-full">
        <Button variant="ghost" onClick={prevStep}>
          Go Back
        </Button>
        {documentsUploaded ? (
          <Button
            onClick={() => {
              const e = getAllCoApplicantsError();
              if (allErrors && Array.isArray(e) && e.length) {
                setApplicantErrors(true);
                e.forEach((d) => toast.error(d));
                return;
              }
              nextStep();
            }}
          >
            Proceed to Next Step
          </Button>
        ) : (
          <Button onClick={handleSubmit}>Submit</Button>
        )}
      </section>

      {showAadharPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl mb-4">Upload Both Sides of Aadhar Card</h3>
            <p className="mb-6">
              We require both sides of your Aadhar card. <br /> This helps us
              verify your identity accurately and expedite your application.
            </p>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => handleAadharPopupResponse(false)}>
                Close
              </Button>
              <Button onClick={() => handleAadharPopupResponse(true)}>
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCoApplicantPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl mb-4">Add a Co-Applicant</h3>
            <p className="mb-6">Do you want to add a co-applicant?</p>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => handleCoApplicantPopupResponse(false)}>
                No
              </Button>
              <Button onClick={() => handleCoApplicantPopupResponse(true)}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteCoApplicantPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl mb-4">Remove Co-Applicant</h3>
            <p className="mb-6">Do you want to remove this co-applicant?</p>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => setShowDeleteCoApplicantPopup(false)}>
                No
              </Button>
              <Button onClick={deleteCoApplicant}>Yes</Button>
            </div>
          </div>
        </div>
      )}

      {isDigilockerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl mb-4"></h3>
            <p className="mb-6">Validaing</p>
            <div className="flex justify-end space-x-4">
              <PageLoader />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Heading() {
  return (
    <div className="flex items-center">
      Our team will verify your eligibility and provide you with the best offers
      for you
      <InfoIcon
        className="w-4 h-4 text-[#8E30A0] cursor-pointer ml-1 hover:text-[#8E30A0]"
        data-tooltip-id="my-tooltip"
        data-tooltip-content="Please note: Once the document is uploaded, it cannot be edited or replaced. Ensure that the correct file is selected before proceeding. "
      />
      <Tooltip
        id="my-tooltip"
        place="bottom"
        style={{ width: "25%" }}
        className="z-10"
      />
    </div>
  );
}
