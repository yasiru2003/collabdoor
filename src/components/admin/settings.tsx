
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSystemSetting, useUpdateSystemSetting } from "@/hooks/use-system-settings";
import { AlertCircle } from "lucide-react";

export function AdminSettings() {
  const { toast } = useToast();
  
  // Project approval setting
  const { data: requireProjectApproval, isLoading: loadingProjectApproval } = 
    useSystemSetting("require_project_approval");
  
  const [isProjectApprovalEnabled, setIsProjectApprovalEnabled] = useState(false);
  const updateSystemSetting = useUpdateSystemSetting();
  
  useEffect(() => {
    if (requireProjectApproval !== undefined && requireProjectApproval !== null) {
      setIsProjectApprovalEnabled(requireProjectApproval.value);
    }
  }, [requireProjectApproval]);

  const handleProjectApprovalChange = (checked: boolean) => {
    setIsProjectApprovalEnabled(checked);
    
    // Check which version of the hook we're using by inspecting the data structure
    if (requireProjectApproval && 'id' in requireProjectApproval) {
      // Using the hook from use-system-settings.ts
      updateSystemSetting.mutate({
        id: requireProjectApproval.id, 
        value: checked
      });
    } else {
      // Using the hook from use-system-settings.tsx
      // Use type assertion to inform TypeScript about the expected structure
      type TSXMutateParams = { key: string; value: boolean; description?: string };
      (updateSystemSetting.mutate as (params: TSXMutateParams) => void)({
        key: 'require_project_approval', 
        value: checked,
        description: 'Require admin approval before projects are published'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure global system settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-y-1">
          <div className="space-y-1">
            <Label htmlFor="project-approval" className="text-base font-medium">
              Require Project Approval
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, new projects will require admin approval before being published
            </p>
          </div>
          <Switch
            id="project-approval"
            checked={isProjectApprovalEnabled}
            onCheckedChange={handleProjectApprovalChange}
            disabled={loadingProjectApproval || updateSystemSetting.isPending}
          />
        </div>
        
        {isProjectApprovalEnabled && (
          <div className="mt-4 border rounded-md p-4 bg-muted/40">
            <div className="flex items-center mb-2 gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-medium">Project approval is enabled</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              New projects submitted for publishing will require admin approval in the Projects tab before they become publicly visible.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
