"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface FormContextType {
  loanAmount: number;
  setLoanAmount: (amount: number) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(0);

  return (
    <FormContext.Provider value={{ loanAmount, setLoanAmount }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
