import axiosInstance from "./axios-config";
import { handlePromise } from "./utils";

export interface UserData {
  phoneNumber: string;
  name: string;
  dob: string;
  email: string;
  loanRequirement: number;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otp: string;
}

export class ApiCalls {
  static fetchDigilockerFiles(data: { requestId: string; scope: string }) {
    return handlePromise(axiosInstance.post("fetchDigilockerFiles", data));
  }
  static async fetchUserData() {
    const [response, error] = await handlePromise(axiosInstance.get("me"));

    if (error) {
      console.error("Error fetching user data:", error);
      return null;
    }

    return response?.data;
  }

  static createUser(data: UserData) {
    return handlePromise(axiosInstance.post("sendOtp", data));
  }

  static verifyOtp(data: VerifyOtpPayload) {
    return handlePromise(axiosInstance.post("verifyOtp", data));
  }
}
