
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, FolderPlus, User, BookOpen } from "lucide-react";

interface OnboardingFlowProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingFlow({ open, onClose }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const handleOrganizationYes = () => {
    navigate('/organizations/new');
    onClose();
  };
  
  const handleProjectYes = () => {
    navigate('/projects/new');
    onClose();
  };
  
  const handleProfileYes = () => {
    navigate('/profile');
    onClose();
  };
  
  const handleBrowseYes = () => {
    navigate('/browse/projects');
    onClose();
  };

  const stepContent = {
    1: {
      title: "Welcome to CollabDoor!",
      description: "Would you like to create an organization?",
      icon: <Building className="w-12 h-12 text-primary mb-4" />,
      actions: (
        <>
          <Button onClick={handleOrganizationYes}>Yes, create organization</Button>
          <Button variant="outline" onClick={() => setStep(2)}>Skip for now</Button>
        </>
      )
    },
    2: {
      title: "Create a Project",
      description: "Would you like to create your first project?",
      icon: <FolderPlus className="w-12 h-12 text-primary mb-4" />,
      actions: (
        <>
          <Button onClick={handleProjectYes}>Yes, create project</Button>
          <Button variant="outline" onClick={() => setStep(3)}>Skip for now</Button>
        </>
      )
    },
    3: {
      title: "Complete Your Profile",
      description: "Would you like to edit your profile now?",
      icon: <User className="w-12 h-12 text-primary mb-4" />,
      actions: (
        <>
          <Button onClick={handleProfileYes}>Yes, edit profile</Button>
          <Button variant="outline" onClick={() => setStep(4)}>Skip for now</Button>
        </>
      )
    },
    4: {
      title: "Explore CollabDoor",
      description: "Would you like to browse projects and organizations?",
      icon: <BookOpen className="w-12 h-12 text-primary mb-4" />,
      actions: (
        <>
          <Button onClick={handleBrowseYes}>Yes, start browsing</Button>
          <Button variant="outline" onClick={() => {
            navigate('/dashboard');
            onClose();
          }}>Go to dashboard</Button>
        </>
      )
    }
  };

  const currentStep = stepContent[step as keyof typeof stepContent];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {currentStep.icon}
            <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
            <DialogDescription className="mt-2">
              {currentStep.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-6">
          {currentStep.actions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
