import { LoaderCircle } from "lucide-react";
import React from "react";

type Props = {};

export default function PageLoader({}: Props) {
  return (
    <div>
      <div className="!h-full min-h-[60vh] gap-1 w-full flex flex-col items-center text-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-purple-600" />
        {/* <h1 className="text-2xl">Fetching data, please wait......</h1> */}
      </div>
    </div>
  );
}
