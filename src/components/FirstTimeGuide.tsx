
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  LayoutDashboard,
  UserPlus,
  ArrowRight,
  Home 
} from "lucide-react";

export function FirstTimeGuide() {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to CollabDoor",
      description: "Let's take a quick tour of the platform and help you get started.",
      icon: Home,
    },
    {
      title: "Create Your Profile",
      description: "Start by setting up your profile. Click on your avatar in the top right to add your information and preferences.",
      icon: UserPlus,
    },
    {
      title: "Browse Projects",
      description: "Explore collaboration opportunities in the Projects section. You can filter by category, status, and more.",
      icon: Building,
    },
    {
      title: "Your Dashboard",
      description: "Track your projects, applications, and partnerships all in one place through your personalized dashboard.",
      icon: LayoutDashboard,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to localStorage that the guide has been shown
      localStorage.setItem("guideSeen", "true");
      setOpen(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("guideSeen", "true");
    setOpen(false);
  };

  // Don't show if user has seen the guide
  if (localStorage.getItem("guideSeen")) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {steps[currentStep].icon && (
                <steps[currentStep].icon className="w-8 h-8 text-primary" />
              )}
            </div>
            <p className="text-center text-muted-foreground text-lg">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
