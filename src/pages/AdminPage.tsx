
import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminUsers } from "@/components/admin/users";
import { AdminProjects } from "@/components/admin/projects";
import { AdminOrganizations } from "@/components/admin/organizations";
import { AdminSettings } from "@/components/admin/settings";
import { AdminApprovals } from "@/components/admin/approvals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertCircle, BellRing } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Allow access for the specific admin email and any additional admin users
  // This ensures that users with admin privileges can access the admin panel
  const adminEmails = ["yasirubandaraprivate@gmail.com"];
  const isAdmin = user && adminEmails.includes(user.email);
  
  // Fetch pending approval counts
  const { data: pendingApprovals } = useQuery({
    queryKey: ["admin-pending-approvals"],
    queryFn: async () => {
      const [orgResult, projectResult] = await Promise.all([
        supabase
          .from('organizations')
          .select('count', { count: 'exact', head: true })
          .eq('status', 'pending_approval'),
        supabase
          .from('projects')
          .select('count', { count: 'exact', head: true })
          .eq('status', 'pending_publish')
      ]);
      
      return {
        organizations: orgResult.count || 0,
        projects: projectResult.count || 0,
        total: (orgResult.count || 0) + (projectResult.count || 0)
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const totalPendingCount = pendingApprovals?.total || 0;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. This page is restricted to administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-8 gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="ml-auto text-sm text-muted-foreground">
            admin.collabdoor.com
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="approvals" className="relative">
              Approvals
              {totalPendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                  {totalPendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          
          <TabsContent value="projects">
            <AdminProjects />
          </TabsContent>
          
          <TabsContent value="organizations">
            <AdminOrganizations />
          </TabsContent>
          
          <TabsContent value="approvals">
            <AdminApprovals />
          </TabsContent>
          
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
