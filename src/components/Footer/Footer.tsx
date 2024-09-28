// components/Footer.js
import Link from "next/link";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { TiSocialTwitter } from "react-icons/ti";
import { MdOutlineFacebook } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import Image from "next/image";

const Footer = () => {
  return (
    <>
      <footer className="bg-[#080808] text-white py-10 ">
        <div className=" mx-auto  lg:px-40 px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <img
                src="/images/assured-sumLogo.png"
                alt="Assured Sum"
                className="h-20 w-auto mb-4"
              />
              <p className="text-white">
                {` Assured Sum Financial Solutions is an aggregator platform that
                seamlessly connects Home Buyers, Real Estate Developers,
                Connectors, and Lenders (Banks & NBFCs) on a single platform,
                streamlining the processing of Home Loans for a hassle-free
                experience.`}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/about"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> About Us
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/partners"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Our
                    Partners
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/credit-score"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Credit
                    Score
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/blogs"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/contact"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Contact
                    Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/home-loan"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Home Loan
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/personal-loan"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Personal
                    Loan
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/project-financing"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Project
                    Financing
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/start-up-loan"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Start Up
                    Loan
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/working-capital-loan"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Working
                    Capital Loan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/privacy-policy"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Privacy
                    Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/terms-conditions"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" />{" "}
                    {`Terms &
                    Conditions`}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white hover:text-white flex items-center"
                    href="/support"
                  >
                    <MdKeyboardDoubleArrowRight className="text-xl" /> Support
                    Page
                  </Link>
                </li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <Link
                  href="https://twitter.com"
                  className="text-white bg-[#8E30A0] h-8 w-8 flex items-center justify-center rounded-full hover:text-[#8E30A0] hover:bg-white"
                >
                  <TiSocialTwitter className="text-lg" />
                </Link>
                <Link
                  href="https://facebook.com"
                  className="text-white bg-[#8E30A0] h-8 w-8 flex items-center justify-center rounded-full hover:text-[#8E30A0] hover:bg-white"
                >
                  <MdOutlineFacebook className="text-lg" />
                </Link>
                <Link
                  href="https://instagram.com"
                  className="text-white bg-[#8E30A0] h-8 w-8 flex items-center justify-center rounded-full hover:text-[#8E30A0] hover:bg-white"
                >
                  <FaInstagram className="text-lg" />
                </Link>
                <Link
                  href="https://linkedin.com"
                  className="text-white bg-[#8E30A0] h-8 w-8 flex items-center justify-center rounded-full hover:text-[#8E30A0] hover:bg-white"
                >
                  <FaLinkedin className="text-lg" />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap space-x-4 space-y-4 mt-5 cursor-pointer">
            <Image
              src="/images/DUNS-LOGO.png"
              alt="Dun & Bradstreet"
              className="h-16 w-auto"
              height={100}
              width={100}
              quality={100}
            />
            <Image
              src="/images/DMCA-LOGO-Photoroom.png"
              alt="DMCA"
              className="h-16 w-auto rounded-md"
              height={100}
              width={100}
              quality={100}
            />
            <Image
              src="/images/app-1.png"
              alt="DMCA"
              className="h-16 w-auto"
              height={100}
              width={100}
              quality={100}
            />
            <Image
              src="/images/play-1.png"
              alt="DMCA"
              className="h-16 w-auto border-2 border-white rounded-md p-1"
              height={100}
              width={100}
              quality={100}
            />
          </div>
        </div>
      </footer>
      <div className="border-t border-gray-700 pt-10 pb-10 text-center text-white bg-[#8E30A0]">
        <p className="font-semibold">
          &copy; 2024 Assured Sum Financial Solutions Pvt. Ltd.
        </p>
        <p className="text-md mt-2 lg:px-28 px-8">
          {` *Terms and conditions apply. Credit is subject to the sole discretion
          of the lender, encompassing credit appraisal, eligibility checks,
          interest rates, processing fees, other charges, and terms as per the
          lender's policy.`}
        </p>
      </div>
    </>
  );
};

export default Footer;
