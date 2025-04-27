
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { Loader2 } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

export function AdminSettings() {
  const { settings, isLoading, updateSetting, getSetting } = useSystemSettings();

  // Settings
  const requireProjectApproval = getSetting("require_project_approval", true);
  const requireOrgApproval = getSetting("require_organization_approval", true);
  const allowCustomPartnershipTypes = getSetting("allow_custom_partnership_types", true);

  // Handlers
  const handleToggleSetting = async (key: string, currentValue: boolean) => {
    await updateSetting.mutateAsync({ key, value: !currentValue });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure system-wide settings and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="approval">
          {/* Content Approval Settings */}
          <AccordionItem value="approval">
            <AccordionTrigger>Content Approval Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-project-approval" className="text-base font-medium">
                      Require Project Approval
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Projects must be approved by an admin before they are publicly visible
                    </p>
                  </div>
                  <Switch
                    id="require-project-approval"
                    checked={requireProjectApproval}
                    onCheckedChange={() => handleToggleSetting("require_project_approval", requireProjectApproval)}
                    disabled={updateSetting.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-org-approval" className="text-base font-medium">
                      Require Organization Approval
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New organizations must be approved by an admin before they are publicly visible
                    </p>
                  </div>
                  <Switch
                    id="require-org-approval"
                    checked={requireOrgApproval}
                    onCheckedChange={() => handleToggleSetting("require_organization_approval", requireOrgApproval)}
                    disabled={updateSetting.isPending}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Project Settings */}
          <AccordionItem value="projects">
            <AccordionTrigger>Project Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-custom-partnership-types" className="text-base font-medium">
                      Allow Custom Partnership Types
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Project organizers can create custom partnership types beyond the default ones
                    </p>
                  </div>
                  <Switch
                    id="allow-custom-partnership-types"
                    checked={allowCustomPartnershipTypes}
                    onCheckedChange={() => handleToggleSetting("allow_custom_partnership_types", allowCustomPartnershipTypes)}
                    disabled={updateSetting.isPending}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Platform Settings */}
          <AccordionItem value="platform">
            <AccordionTrigger>Platform Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode" className="text-base font-medium">
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to temporarily restrict access to the platform
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={getSetting("maintenance_mode", false)}
                    onCheckedChange={() => handleToggleSetting("maintenance_mode", getSetting("maintenance_mode", false))}
                    disabled={updateSetting.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-registration" className="text-base font-medium">
                      Enable User Registration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register for accounts
                    </p>
                  </div>
                  <Switch
                    id="enable-registration"
                    checked={getSetting("enable_registration", true)}
                    onCheckedChange={() => handleToggleSetting("enable_registration", getSetting("enable_registration", true))}
                    disabled={updateSetting.isPending}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Setting changes apply immediately across the platform.
          </p>
          <p className="text-sm text-muted-foreground">
            Last system settings update: {settings.length > 0 ? new Date(settings[0].updated_at).toLocaleString() : "Never"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
