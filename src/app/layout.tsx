/** @format */

import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import HomeLoanPromotion from "@/components/Applyloan/ApplyLoan";
import { FormProvider } from "@/components/FormContext";

const kumbh = Kumbh_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Assured Sum",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={kumbh.className}>
        <FormProvider>
          <Header />
          {/* <HomeLoanPromotion /> */}
          {children}
          <Footer />
        </FormProvider>
      </body>
    </html>
  );
}
