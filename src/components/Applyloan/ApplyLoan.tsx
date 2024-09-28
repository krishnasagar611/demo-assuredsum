// components/HomeLoanPromotion.js
import { url } from "inspector";
import Image from "next/image";

const HomeLoanPromotion = () => {
  return (
    <section
      style={{
        backgroundImage: "url(/images/slider_bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="px-28 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl font-bold text-black">
            Your <span className="text-[#8E30A0]">Dream Home</span> with
          </h1>
          <p className="text-2xl font-medium">
            Faster, Effortless & Hassle-Free{" "}
            <span className="text-[#C1289A]">Home Loans.</span>
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/paperless.png"
                alt="Paperless Application"
                width={50}
                height={50}
              />
              <span className="text-lg text-gray-700">
                Paperless Application
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Image
                src="/images/percentage.png"
                alt="Lowest Interest Rates"
                width={50}
                height={50}
              />
              <span className="text-lg text-gray-700">
                Lowest Interest Rates
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Image
                src="/images/credit-free.png"
                alt="Free Credit Score"
                width={50}
                height={50}
              />
              <span className="text-lg text-gray-700">Free Credit Score</span>
            </div>
            <div className="flex items-center space-x-4">
              <Image
                src="/images/bank.png"
                alt="Get access from 15+ Bank & NBFCs"
                width={50}
                height={50}
              />
              <span className="text-lg text-gray-700">
                Get access from 15+ Bank & NBFCs
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src="/images/applyloan.png"
            alt="Home Loan Illustration"
            width={500}
            height={500}
          />
        </div>
      </div>
    </section>
  );
};

export default HomeLoanPromotion;
