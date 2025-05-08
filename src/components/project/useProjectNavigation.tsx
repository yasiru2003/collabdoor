
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useProjectNavigation() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContact = (organizerId: string, organizerName: string, userId: string | undefined) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact project organizers.",
        variant: "destructive",
      });
      navigate("/login", { state: { returnTo: `/projects/${organizerId}` } });
      return;
    }

    // Navigate to messages page with the organizer contact info
    navigate("/messages", { 
      state: { 
        participantId: organizerId,
        participantName: organizerName
      } 
    });
  };

  const navigateToOrganization = (organizationId: string | undefined) => {
    if (organizationId) {
      navigate(`/organizations/${organizationId}`);
    }
  };
  
  const navigateToOrganizerProfile = (organizerId: string | undefined) => {
    if (organizerId) {
      navigate(`/profile/${organizerId}`);
    }
  };

  const handleMessageApplicant = (applicantId: string, applicantName: string) => {
    navigate("/messages", { 
      state: { 
        participantId: applicantId,
        participantName: applicantName
      } 
    });
  };

  return {
    handleContact,
    navigateToOrganization,
    navigateToOrganizerProfile,
    handleMessageApplicant
  };
}
