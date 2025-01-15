import React from "react";
import { Stepper, Step, StepLabel, styled } from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";

// Custom styling for the stepper
const CustomStepper = styled(Stepper)(() => ({
  "& .MuiStepLabel-label": {
    color: "#fff",
    fontSize: "0.75rem",
    lineHeight: 1.2,
  },
  "& .MuiStepIcon-root": {
    color: "#666",
    cursor: "pointer",
    fontSize: "1.25rem",
    "&.Mui-active": {
      color: "#fff",
    },
    "&.Mui-completed": {
      color: "#fff",
    },
  },
  "& .MuiStepConnector-line": {
    borderColor: "#666",
    top: "8px",
  },
  "& .MuiStepLabel-root": {
    cursor: "pointer",
    padding: "0",
  },
}));

const steps = [
  { label: "能源ECF", path: "/energy-ecf" },
  { label: "組織能源使用", path: "/org-energy-usage" },
  { label: "場域設定", path: "/area-settings" },
  { label: "耗能設備一覽表", path: "/energy-equipment" },
  { label: "同類耗能主體設定", path: "/energy-subject-settings" },
  { label: "能源審查", path: "/energy-review" },
  { label: "重大能源使用SEU", path: "/seu" },
  { label: "EnB能源基線", path: "/enb" },
  { label: "EnPI能源績效指標", path: "/enpi" },
];

export function WorkflowStepper() {
  const router = useRouter();
  const activeStep = steps.findIndex((step) => step.path === router.asPath);

  return (
    <div className="px-2 py-2">
      <CustomStepper activeStep={activeStep} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.path}>
            <Link href={step.path} style={{ textDecoration: "none" }}>
              <StepLabel>{step.label}</StepLabel>
            </Link>
          </Step>
        ))}
      </CustomStepper>
    </div>
  );
}
