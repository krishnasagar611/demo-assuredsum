import { LoaderCircle } from "lucide-react";
import React from "react";

type Props = {};

export default function Loader({}: Props) {
  return (
    <div className=" flex items-center justify-center">
      <LoaderCircle className="h-6 w-6 animate-spin text-[#8E30A0]" />
    </div>
  );
}
