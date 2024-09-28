/** @format */

import { cn } from "@/utils/cn";
import React from "react";

interface ButtonType extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";"type"?: "submit" | "button" | "reset";
}

export default function Button(props: ButtonType) {
  return (
    <button
      {...props}
      className={cn(
        "text-white w-fit  bg-[#8E30A0] hover:bg-marine-blue focus:outline-none font-medium rounded-lg text-sm   px-5 py-2.5 text-center",
        {
          "bg-marine-blue": props.variant == "primary"
        },
        {
          "bg-purplish-blue": props.variant == "secondary"
        },
        {
          "bg-gray-500 text-white focus:ring-0 hover:bg-gray-400": props.variant == "ghost"
        }
      )}
    />
  );
}
