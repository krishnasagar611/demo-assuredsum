import axios from "axios";
export const appUrl = "https://api-dev.assuredsum.com/api/v1";
// export const appUrl = "http://localhost:3001/api/v1";

import Cookies from "js-cookie";

const token = Cookies.get("authToken");

const axiosInstance = axios.create({
  baseURL: appUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

axiosInstance.interceptors.request.use(
  (config) => {
  
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(
        `Error ${error.response.status}: ${error.response.data.message}`
      );
      if (error.response.status === 401) {
        // Handle unauthorized access, like redirecting to login
        console.log("Unauthorized, redirecting to login...");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from the server");
    } else {
      // Something happened in setting up the request
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
