"use client";
import { appUrl } from "@/utils/axios-config";
import Cookies from "js-cookie";
import { CreditCardIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";
import Button from "../Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Initialize useRouter

  const fetchUserData = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      // console.error("No auth token found");
      return null;
    }

    try {
      const response = await fetch(`${appUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      // console.error("Error fetching user data:", error);
      return null;
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    setIsLoggedIn(false);
    toast.success("Logged out successfully!");
    setTimeout(() => {
      router.push("/auth/log-in");
    }, 3000);
  };

  useEffect(() => {
    const token = Cookies.get("authToken");
    // console.log("Auth Token:", token);

    if (token) {
      // console.log("User is logged in");
      setIsLoggedIn(true);
    } else {
      // console.log("User is not logged in");
    }

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchUserData]);
  const handleLoginClick = () => {
    setLoading(true);
    router.push("/auth/log-in");
  };

  return (
    <header
      className={`bg-white shadow-md ${
        isSticky
          ? "fixed top-0 left-0 right-0 z-50 transition-transform duration-100"
          : ""
      }`}
    >
      <div className="mx-auto flex justify-between items-center py-6 lg:px-28 px-10">
        <div className="flex items-center cursor-pointer">
          <Link href="/">
            <img
              src="/images/assured-sumLogo.png"
              alt="Assured Sum"
              className="h-14 w-auto"
            />
          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          {/* Links */}
          <Link
            className="text-gray-700 font-medium hover:text-[#8E30A0]"
            href="https://assuredsum.com/"
          >
            Home
          </Link>
          <Link
            className="text-gray-700 font-medium hover:text-[#8E30A0]"
            href="https://assuredsum.com/about/"
          >
            About Us
          </Link>
          <Link
            className="text-[#8E30A0] font-medium hover:text-[#8E30A0]"
            href="/"
          >
            Apply Loan
          </Link>
          <Link
            className="text-gray-700 font-medium hover:text-[#8E30A0]"
            href="https://assuredsum.com/banking-partner/"
          >
            Banking Partner
          </Link>
          <Link
            className="text-gray-700 font-medium hover:text-[#8E30A0]"
            href="https://assuredsum.com/credit-score/"
          >
            Credit Score
          </Link>
          <Link
            className="text-gray-700 font-medium hover:text-[#8E30A0]"
            href="https://assuredsum.com/emi-calculator/"
          >
            EMI Calculator
          </Link>
        </nav>
        <div className="hidden md:flex space-x-4">
          {/* Mobile Apps Links */}
          <Link href="https://play.google.com" className="flex items-center">
            <img
              src="/images/play.png"
              alt="Get it on Google Play"
              className="h-10 w-auto"
            />
          </Link>

          <Link href="https://apps.apple.com" className="flex items-center">
            <img
              src="/images/app.png"
              alt="Available on the App Store"
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="hidden md:flex space-x-4">
          {isLoggedIn ? (
            <div className="flex items-left cursor-pointer z-40">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="focus:outline-none">
                    <FaUserCircle className="h-10 w-auto text-[#8E30A0] cursor-pointer hover:text-purple-600 transition-colors duration-300" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-56 py-5 px-4 bg-white shadow-lg rounded-lg border border-gray-200"
                  align="end"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-gray-700 hover:text-purple-700 transition-colors duration-300 cursor-pointer">
                      <CreditCardIcon className="h-5 w-5 text-purple-600" />
                      <Link href="/track-application"> <span className="text-md font-medium">
                        Application Status
                      </span></Link>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full space-x-3 text-gray-700 hover:text-red-600 transition-colors duration-300 focus:outline-none"
                    >
                      <LogOut className="h-5 w-5 text-red-600" />
                      <span className="text-md font-medium">Logout</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <Link href="/auth/log-in" className="flex items-center">
              <Button className="bg-[#8E30A0] text-white px-4 py-2 rounded-md hover:bg-[#8E30A0]">
                Log in
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white absolute z-50 w-full">
          <nav className="flex flex-col space-y-3 px-10 py-8">
            {/* Mobile Nav Links */}
            <Link
              className="text-gray-700 font-medium hover:text-[#8E30A0]"
              href="/"
            >
              Home
            </Link>
            <Link
              className="text-gray-700 font-medium hover:text-[#8E30A0]"
              href="/about"
            >
              About Us
            </Link>
            <Link
              className="text-gray-700 font-medium hover:text-[#8E30A0]"
              href="/apply-loan"
            >
              Apply Loan
            </Link>
            <Link
              className="text-gray-700 font-medium hover:text-[#8E30A0]"
              href="/banking-partner"
            >
              Banking Partner
            </Link>
            <Link
              className="text-gray-700 font-medium hover:text-[#8E30A0]"
              href="/credit-score"
            >
              Credit Score
            </Link>
            <Link
              className="text-gray-700 font-medium hover:text-[#8E30A0]"
              href="/emi-calculator"
            >
              EMI Calculator
            </Link>
            {isLoggedIn ? (
              <Link
                className="text-gray-700 font-medium hover:text-[#8E30A0] flex items-center gap-3"
                href="/profile"
              >
                <FaUserCircle className="h-7 w-auto" /> Profile
              </Link>
            ) : (
              <Link
                className="text-gray-700 font-medium hover:text-[#8E30A0] flex items-center gap-3"
                href="/auth/log-in"
              >
                <FaUserCircle className="h-7 w-auto" /> Log in
              </Link>
            )}
            <div className="flex space-x-4">
              <Link
                href="https://play.google.com"
                className="flex items-center"
              >
                <img
                  src="/images/play.png"
                  alt="Get it on Google Play"
                  className="h-10 w-auto"
                />
              </Link>
              <Link href="https://apps.apple.com" className="flex items-center">
                <img
                  src="/images/app.png"
                  alt="Available on the App Store"
                  className="h-10 w-auto"
                />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
