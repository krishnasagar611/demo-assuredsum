"use client";
import { SetStateAction, useState } from "react";
import React from "react";
import ContentSection from "../Title";
import Button from "../Button";
import {
  Home,
  Monitor,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ProgressSteps from "./TrackMyApplicationstatus";
import LoanProcessTracker from "./MyApplication";

const DashboardItem = ({
  icon,
  title,
  bgColor,
  textColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  textColor: string;
  onClick?: () => void;
}) => (
  <div
    className={`p-4 rounded-lg shadow-md flex flex-col items-center justify-center ${bgColor} ${textColor} cursor-pointer`}
    onClick={onClick}
  >
    {icon}
    <p className="mt-2 text-sm font-medium text-center">{title}</p>
  </div>
);

const MyApplication = () => (
  <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
    <LoanProcessTracker />
  </div>
);

const TrackApplication = () => (
  <div className=" bg-white rounded-lg shadow-md">
    <ProgressSteps />
  </div>
);

export default function TrackMyapplication() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const handleItemClick = (componentName: string) => {
    setActiveComponent(componentName);
  };

  const handleBack = () => {
    setActiveComponent(null);
  };

  const renderDashboard = () => (
    <>
      <ContentSection
        title="Check Your Application Status"
        para="Double-check everything looks OK before confirming."
      />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardItem
            icon={<Search className="w-14 h-14" />}
            title="Track Application"
            bgColor="bg-white"
            textColor="text-gray-800"
            onClick={() => handleItemClick("myApplication")}
          />
          <DashboardItem
            icon={<Monitor className="w-14 h-14" />}
            title="My Application"
            bgColor="bg-white"
            textColor="text-gray-800"
            onClick={() => handleItemClick("trackApplication")}
          />
          <div className="cursor-pointer">
            <Link href="https://assuredsum.com/credit-score/" target="_blank">
              <DashboardItem
                icon={
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 rounded-full" />
                    <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                }
                title="Check Credit Score"
                bgColor="bg-white"
                textColor="text-gray-800"
              />
            </Link>
          </div>
          <DashboardItem
            icon={<Home className="w-14 h-14" />}
            title="New Home Loan"
            bgColor="bg-gradient-to-br from-purple-500 to-blue-500"
            textColor="text-white"
          />
          <DashboardItem
            icon={<RefreshCw className="w-14 h-14" />}
            title="Transfer Home Loan"
            bgColor="bg-gradient-to-br from-purple-500 to-blue-500"
            textColor="text-white"
          />
          <DashboardItem
            icon={<User className="w-14 h-14" />}
            title="Personal Loan"
            bgColor="bg-gradient-to-br from-purple-500 to-blue-500"
            textColor="text-white"
          />
        </div>
      </div>
    </>
  );

  const renderActiveComponent = () => (
    <>
      <div className="flex items-center mb-4">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">
          {activeComponent === "myApplication"
            ? "Track Application"
            : "My Application"}
        </h1>
      </div>
      {activeComponent === "myApplication" && <MyApplication />}
      {activeComponent === "trackApplication" && <TrackApplication />}
    </>
  );

  return (
    <div className="flex justify-start flex-col gap-10 h-full">
      {activeComponent ? renderActiveComponent() : renderDashboard()}
    </div>
  );
}
