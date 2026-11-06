"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ProjectInquiryModal } from "@/components/ProjectInquiryModal";
import type { MonthlyPackageId } from "@/lib/monthly-packages";

interface ProjectInquiryContextType {
  openModal: (packageId?: MonthlyPackageId) => void;
  closeModal: () => void;
  isOpen: boolean;
}

const ProjectInquiryContext = createContext<ProjectInquiryContextType>({
  openModal: () => {},
  closeModal: () => {},
  isOpen: false,
});

export function ProjectInquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<MonthlyPackageId | "">("");

  const openModal = (packageId?: MonthlyPackageId) => {
    window.dispatchEvent(new CustomEvent("a2:project-form-open"));
    setSelectedPackage(packageId || "");
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setSelectedPackage("");
  };

  return (
    <ProjectInquiryContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <ProjectInquiryModal
        isOpen={isOpen}
        onClose={closeModal}
        initialPackage={selectedPackage}
      />
    </ProjectInquiryContext.Provider>
  );
}

export function useProjectInquiryModal() {
  return useContext(ProjectInquiryContext);
}
