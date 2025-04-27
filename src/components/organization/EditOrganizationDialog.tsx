
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrganizationForm } from "./OrganizationForm";
import { Organization } from "@/types";

interface EditOrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationUpdated: () => void;
}

export function EditOrganizationDialog({
  organization,
  open,
  onOpenChange,
  onOrganizationUpdated,
}: EditOrganizationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update your organization's information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <OrganizationForm 
            organization={organization} 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
