
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function PasswordChangeForm() {
  const { toast } = useToast();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your password</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => { 
          e.preventDefault(); 
          toast({
            title: "Coming soon",
            description: "Password change functionality will be available soon."
          });
        }}>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Update Password</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function EmailNotificationsForm() {
  const { toast } = useToast();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Manage your email preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">New Partnership Requests</h4>
              <p className="text-sm text-muted-foreground">Get notified when someone applies to your project</p>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-partnership" className="rounded border-gray-300" defaultChecked />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Project Updates</h4>
              <p className="text-sm text-muted-foreground">Get notified about updates to projects you're involved with</p>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-updates" className="rounded border-gray-300" defaultChecked />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Direct Messages</h4>
              <p className="text-sm text-muted-foreground">Get notified when you receive a direct message</p>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-messages" className="rounded border-gray-300" defaultChecked />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Marketing</h4>
              <p className="text-sm text-muted-foreground">Receive newsletter and promotional emails</p>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-marketing" className="rounded border-gray-300" />
            </div>
          </div>
          
          <Button onClick={() => {
            toast({
              title: "Coming soon",
              description: "Email preferences will be available soon."
            });
          }}>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DangerZone() {
  const { toast } = useToast();
  
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Proceed with caution, these actions cannot be undone
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="destructive"
          onClick={() => {
            toast({
              title: "Coming soon",
              description: "Account deletion will be available soon."
            });
          }}
        >
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
}

export function AccountSettings() {
  return (
    <div className="grid gap-6">
      <PasswordChangeForm />
      <EmailNotificationsForm />
      <DangerZone />
    </div>
  );
}
