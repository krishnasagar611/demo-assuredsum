import bgSidebarDesktop from "@/assets/images//banner.jpg";
import bgSidebarMobile from "@/assets/images/_mobile.jpg";
import { cn } from "@/utils/cn";
import Image from "next/image";

const fromSteps = [
  { step: 1, title: "Basic info" },
  { step: 2, title: "Requirements" },
  { step: 3, title: "Upload documents" },
  { step: 4, title: "Form Submission" },
  { step: 5, title: "Select offers" },
];

type SidebarProps = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  excludeStep: number[];
};

export default function Sidebar({
  activeStep,
  setActiveStep,
  excludeStep,
}: SidebarProps) {
  return (
    <div className="relative z-10 hidden md:flex">
      <Image
        className="hidden md:flex"
        src={bgSidebarDesktop}
        alt="bg-sidebar-desktop"
      />

      <div className="absolute top-0 left-0 py-8 px-8 flex md:flex-col gap-6 cursor-pointer">
        {fromSteps.map((step, index) => (
          <ProgressStep
            key={index}
            activeStep={activeStep}
            title={step.title}
            step={step.step}
            onClick={() => setActiveStep(step.step)}
            disable={excludeStep.includes(step.step)}
          />
        ))}
      </div>
    </div>
  );
}

type ProgressStepProps = {
  step: number;
  title: string;
  activeStep: number;
  onClick: () => void;
  disable: boolean;
};

function ProgressStep({
  step,
  title,
  activeStep,
  onClick,
  disable,
}: ProgressStepProps) {
  return (
    <div className="flex gap-6 items-center" onClick={disable ? {} : onClick}>
      <div
        className={cn(
          "h-5 w-5 border border-white p-4 rounded-full flex items-center justify-center text-white font-semibold",
          { " text-black bg-white": activeStep === step }
        )}
      >
        {step}
      </div>
      <div className="hidden md:block">
        <p className="text-white font-bold capitalize">{title}</p>
      </div>
    </div>
  );
}

export function MobileSidebar({
  activeStep,
  setActiveStep,
  excludeStep,
}: SidebarProps) {
  return (
    <div className="md:hidden fixed z-10 top-0 left-0 w-full">
      <Image
        className="md:hidden w-full object-contain"
        src={bgSidebarMobile}
        alt="bg-sidebar-mobile"
      />

      <div className="absolute z-10 py-8 px-8 flex md:flex-col gap-6 top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {fromSteps.map((step, index) => (
          <ProgressStep
            key={index}
            activeStep={activeStep}
            title={step.title}
            step={step.step}
            onClick={() => setActiveStep(step.step)}
            disable={excludeStep.includes(step.step)}
          />
        ))}
      </div>
    </div>
  );
}
