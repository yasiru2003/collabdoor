
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SystemSettings } from "@/types";
import { useSystemSetting } from "@/hooks/use-system-settings";
import { useQueryClient } from "@tanstack/react-query";

export function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Project approval setting
  const { data: requireProjectApproval, isLoading: loadingProjectApproval } = 
    useSystemSetting("require_project_approval");
  
  const [isProjectApprovalEnabled, setIsProjectApprovalEnabled] = useState(false);
  
  useEffect(() => {
    if (requireProjectApproval !== undefined) {
      setIsProjectApprovalEnabled(requireProjectApproval.value);
    }
  }, [requireProjectApproval]);

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key, 
          value,
          // If the setting doesn't exist yet, provide a description
          description: key === 'require_project_approval' 
            ? 'Require admin approval before projects are published'
            : undefined
        }, { 
          onConflict: 'key',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Setting updated",
        description: "The system setting has been updated successfully."
      });
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
      
    } catch (error: any) {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive"
      });
    }
  };

  const handleProjectApprovalChange = (checked: boolean) => {
    setIsProjectApprovalEnabled(checked);
    updateSetting('require_project_approval', checked);
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
            disabled={loadingProjectApproval}
          />
        </div>
      </CardContent>
    </Card>
  );
}
