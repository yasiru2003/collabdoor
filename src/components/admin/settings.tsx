
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/use-system-settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function AdminSettings() {
  const { data: settings, isLoading, error } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State to track if we're ensuring default settings
  const [ensuringDefaults, setEnsuringDefaults] = useState(false);
  
  // Handle toggle change
  const handleToggle = (setting: any, value: boolean) => {
    updateSetting.mutate({ id: setting.id, value });
  };
  
  // Function to ensure default settings exist
  const ensureDefaultSettings = async () => {
    setEnsuringDefaults(true);
    
    try {
      // Define default settings
      const defaultSettings = [
        {
          key: "require_project_approval",
          value: true,
          description: "Projects require admin approval before being published"
        },
        {
          key: "require_organization_approval",
          value: true,
          description: "Organizations require admin approval before becoming active"
        },
        {
          key: "enable_partner_registration",
          value: true,
          description: "Allow users to register as partners"
        },
        {
          key: "enable_organizer_registration",
          value: true,
          description: "Allow users to register as organizers"
        }
      ];
      
      // Check existing settings
      const { data: existingSettings } = await supabase
        .from("system_settings")
        .select("key");
      
      const existingKeys = existingSettings?.map(s => s.key) || [];
      
      // Insert missing settings
      for (const setting of defaultSettings) {
        if (!existingKeys.includes(setting.key)) {
          const { error } = await supabase
            .from("system_settings")
            .insert(setting);
            
          if (error) {
            console.error(`Error creating ${setting.key} setting:`, error);
          }
        }
      }
      
      toast({
        title: "Settings initialized",
        description: "Default system settings have been created",
      });
      
      // Refresh settings
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      
    } catch (error: any) {
      console.error("Error ensuring default settings:", error);
      toast({
        title: "Error",
        description: "Failed to initialize default settings",
        variant: "destructive",
      });
    } finally {
      setEnsuringDefaults(false);
    }
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load system settings: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure global system settings</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : settings && settings.length > 0 ? (
          <div className="space-y-6">
            {settings.map(setting => (
              <div key={setting.id} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={setting.key} className="font-medium">{setting.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                </div>
                <Switch
                  id={setting.key}
                  checked={setting.value}
                  onCheckedChange={(checked) => handleToggle(setting, checked)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4">
            <div className="text-center mb-4">
              <p className="mb-2">No system settings found. Initialize default settings?</p>
              <Button 
                onClick={ensureDefaultSettings}
                disabled={ensuringDefaults}
              >
                {ensuringDefaults ? "Initializing..." : "Initialize Settings"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
