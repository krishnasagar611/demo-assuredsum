import { appUrl } from "@/utils/axios-config";
import axios from "axios";
import Cookies from "js-cookie";
import router from "next/router";
import { useEffect, useState } from "react";
import PageLoader from "../PageLoader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/Tabs";
import UploadDocs from "./UploadDocx";

type FileState = {
  file: File | null;
  fileName: string | null;
  path: string | null;
};

interface DocumentInfo {
  file: File | null;
  fileName: string | null;
  path: string | null;
}

interface Files {
  aadhar: DocumentInfo;
  pan: DocumentInfo;
  itr: DocumentInfo;
  form16: DocumentInfo;
  payslips: DocumentInfo;
  bankStatement: DocumentInfo;
}

function hasPath(document: DocumentInfo): boolean {
  return document.hasOwnProperty("path") && document.path !== null;
}

function checkDocumentsHavePath(
  documents: Record<string, DocumentInfo>
): boolean {
  // Check if all documents have a non-null path
  return Object.values(documents).every((doc) => hasPath(doc));
}

function formatDocuments(userData: any): Files {
  return {
    aadhar: {
      file: null,
      fileName: null,
      path: userData?.documents?.adhar || null,
    },
    pan: {
      file: null,
      fileName: null,
      path: userData?.documents?.pan || null,
    },
    itr: {
      file: null,
      fileName: null,
      path: userData?.documents?.itr || null,
    },
    form16: {
      file: null,
      fileName: null,
      path: userData?.documents?.form16 || null,
    },
    payslips: {
      file: null,
      fileName: null,
      path: Array.isArray(userData?.documents?.payslips)
        ? userData.documents.payslips[0]
        : userData?.documents?.payslips || null,
    },
    bankStatement: {
      file: null,
      fileName: null,
      path: userData?.documents?.bankStatement || null,
    },
  };
}

type Props = {
  nextStep: any;
  prevStep: any;
};

function FormUploadWithTabs(props: Props) {
  const [userData, setUserData] = useState({});
  const [needToRenderTabs, setNeedToRenderTabs] = useState(false);
  const [coApplicants, setCoApplicants] = useState<[]>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>("account");
  const [applicantErrors, setApplicantErrors] = useState(false);
  const [formCanBeEdited, setFormCanBeEdited] = useState(false);
  const fetchUserData = async (
    currentTabValue = null,
    needToSetLoadingState = true
  ) => {
    if (needToSetLoadingState) {
      setLoading(true);
    }
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

      const userData = response?.data?.user;
      const coApplicants = response?.data?.coApplicants;
      setUserData(userData);
      setFormCanBeEdited(userData?.finalSubmit);

      const hasCoApplicant = coApplicants && coApplicants.length > 0;

      if (hasCoApplicant) {
        setNeedToRenderTabs(true);
        setCoApplicants(coApplicants);
      } else {
        setNeedToRenderTabs(false);
        setCoApplicants([]);
      }
      return {
        userData,
        hasCoApplicant: coApplicants && coApplicants.length > 0,
      };
    } catch (error: any) {
      if (error?.status === 401) {
        setTimeout(() => {
          router.push("/auth/log-in");
        }, 3000);
      }
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
      if (currentTabValue) {
        setCurrentTab(currentTabValue);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  function checkCoApplicantsValidationErrorsIn() {
    const errors: any[] = [];
    let name = "Co Applicant";
    coApplicants?.forEach((d:any, i) => {
      const fields = formatDocuments(d);
      const e: any = {
        id: d?._id,
        errors: [],
        name: `${name} ${i + 1}`,
      };
      if (!fields?.aadhar?.path) {
        e.errors.push(" Aadhar");
      }
      if (!fields?.pan?.path) {
        e.errors.push(" Pan");
      }
      if (!fields?.itr?.path) {
        e.errors.push(" ITR");
      }
      if (!fields?.form16?.path) {
        e.errors.push(" Form26");
      }
      if (!fields?.payslips?.path) {
        e.errors.push(" Payslips");
      }
      if (!fields?.bankStatement?.path) {
        e.errors.push(" BankStatement");
      }

      if (e.errors.length) errors.push(e);
    });
    return errors;
  }

  const coApplicantErrors = checkCoApplicantsValidationErrorsIn();

  const primaryApplicantData: any = formatDocuments(userData);

  if (isLoading || !primaryApplicantData) return <PageLoader />;

  if (!needToRenderTabs && primaryApplicantData) {
    return (
      // @ts-ignore
      <UploadDocs
        nextStep={props.nextStep}
        prevStep={props.prevStep}
        initialFiles={primaryApplicantData}
        readonlyMode={checkDocumentsHavePath(primaryApplicantData)}
        forPrimaryApplicant={true}
        needToShowCoApplicantModal={true}
        refresh={fetchUserData}
        allErrors={checkCoApplicantsValidationErrorsIn()}
        setApplicantErrors={setApplicantErrors}
        disableForm={formCanBeEdited}
      />
    );
  }

  const getErroredClass = (id: any) => {
    if (!Array.isArray(coApplicantErrors) || !applicantErrors) return;
    return coApplicantErrors.find((d) => d?.id == id) ? "text-red-500" : "";
  };
  console.log(formCanBeEdited, "formCanBeEdited")
  return (
    <Tabs
      defaultValue={currentTab}
      className="w-full h-full"
      onValueChange={async (tab:any) => {
        setCurrentTab(tab);
        setApplicantErrors(false);
        await fetchUserData(tab, false);
      }}
    >
      <TabsList>
        <TabsTrigger value="account">Primary Applicant</TabsTrigger>
        {Array.isArray(coApplicants) &&
          coApplicants.map((d:any, i) => (
            <TabsTrigger
              value={d?._id}
              key={i}
              className={getErroredClass(d?._id)}
            >
              Co-Applicant {i + 1}
            </TabsTrigger>
          ))}
      </TabsList>
      <TabsContent value="account">

        <UploadDocs
          nextStep={props.nextStep}
          prevStep={props.prevStep}
          initialFiles={primaryApplicantData}
          readonlyMode={checkDocumentsHavePath(primaryApplicantData)}
          forPrimaryApplicant={true}
          // @ts-ignore
          needToShowCoApplicantModal={coApplicants?.length < 3}
          refresh={fetchUserData}
          allErrors={coApplicantErrors}
          setApplicantErrors={setApplicantErrors}
          disableForm={formCanBeEdited}
        />
      </TabsContent>
      {Array.isArray(coApplicants) &&
        coApplicants.map((d:any, i) => (
          <TabsContent value={d?._id} key={i}>
            <UploadDocs
              nextStep={props.nextStep}
              prevStep={props.prevStep}
               // @ts-ignore
              initialFiles={formatDocuments(d)}
               // @ts-ignore
              readonlyMode={checkDocumentsHavePath(formatDocuments(d))}
              forPrimaryApplicant={false}
              coApplicantId={d?._id}
              needToShowCoApplicantModal={coApplicants.length < 3}
              refresh={fetchUserData}
              allErrors={coApplicantErrors}
              setApplicantErrors={setApplicantErrors}
              disableForm={formCanBeEdited}
            />
          </TabsContent>
        ))}
    </Tabs>
  );
}

export default FormUploadWithTabs;
