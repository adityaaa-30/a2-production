"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ProjectInquiryModal } from "@/components/ProjectInquiryModal";

interface ProjectInquiryContextType {
  openModal: () => void;
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

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ProjectInquiryContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <ProjectInquiryModal isOpen={isOpen} onClose={closeModal} />
    </ProjectInquiryContext.Provider>
  );
}

export function useProjectInquiryModal() {
  return useContext(ProjectInquiryContext);
}
