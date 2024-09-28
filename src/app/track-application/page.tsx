import React from "react";
import { User, Search, TrendingUp, Home, FileText, Send } from "lucide-react"; 
import Link from "next/link";
import TrackMyapplication from "@/components/Steps/TrackMyapplication";

const Dashboard = () => {
  return (
    <div className="px-28 py-10 h-screen bg-gray-100">
      <TrackMyapplication />
    </div>
  );
};

export default Dashboard;
