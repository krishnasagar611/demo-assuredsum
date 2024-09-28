import React from 'react';

const LoanProcessTracker = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <div className="bg-purple-500 rounded-full p-3 mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-800 font-bold">In Process</h3>
          <p className="text-gray-500 text-sm">Loan application in progress</p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="bg-blue-500 rounded-full p-3 mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-800 font-bold">Incomplete Documents</h3>
          <p className="text-gray-500 text-sm">
            Additional documents required
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="bg-blue-500 rounded-full p-3 mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-800 font-bold">Verification</h3>
          <p className="text-gray-500 text-sm">
            Documents are being verified
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="bg-gray-300 rounded-full p-3 mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-800 font-bold">Queries Raised</h3>
          <p className="text-gray-500 text-sm">
            Additional information required
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="bg-green-500 rounded-full p-3 mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-800 font-bold">Loan Approved</h3>
          <p className="text-gray-500 text-sm">
            Loan application has been approved
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanProcessTracker;