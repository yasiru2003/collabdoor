
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Check, X, UserCheck, Ban } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { TablesInsert } from "@/integrations/supabase/types";

interface OrganizationJoinRequestProps {
  organizationId: string;
  organizationName: string;
  ownerId: string;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  onStatusChange: (status: 'none' | 'pending' | 'approved' | 'rejected') => void;
}

export function OrganizationJoinRequest({ 
  organizationId, 
  organizationName,
  ownerId,
  status,
  onStatusChange
}: OrganizationJoinRequestProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestJoin = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Insert the join request
      const joinRequest: TablesInsert<'organization_join_requests'> = {
        organization_id: organizationId,
        user_id: user.id,
        message: message,
        status: "pending"
      };

      const { error } = await supabase
        .from("organization_join_requests")
        .insert(joinRequest);
        
      if (error) throw error;
      
      // Send notification to the organization owner
      const notification: TablesInsert<'notifications'> = {
        user_id: ownerId,
        title: "New Join Request",
        message: `${user.email || "Someone"} has requested to join ${organizationName}`,
        link: `/organizations/${organizationId}?tab=requests`,
        read: false
      };

      await supabase
        .from("notifications")
        .insert(notification);
      
      onStatusChange('pending');
      setIsDialogOpen(false);
      
      toast({
        title: "Request sent",
        description: `You have requested to join ${organizationName}. The owner will review your request.`,
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonByStatus = () => {
    switch(status) {
      case 'none':
        return (
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            variant="default"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Request to Join
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" disabled>
            <UserCheck className="h-4 w-4 mr-2" />
            Request Pending
          </Button>
        );
      case 'approved':
        return (
          <Button variant="ghost" disabled className="text-green-600">
            <Check className="h-4 w-4 mr-2" />
            Member
          </Button>
        );
      case 'rejected':
        return (
          <Button variant="ghost" disabled className="text-red-500">
            <Ban className="h-4 w-4 mr-2" />
            Request Rejected
          </Button>
        );
    }
  };

  return (
    <>
      {getButtonByStatus()}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to join {organizationName}</DialogTitle>
            <DialogDescription>
              Submit a request to join this organization. The organization owner will review your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message (Optional)
              </label>
              <Textarea
                id="message"
                placeholder="Tell the organization why you want to join..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestJoin} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
