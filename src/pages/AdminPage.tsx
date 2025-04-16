
import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminUsers } from "@/components/admin/users";
import { AdminProjects } from "@/components/admin/projects";
import { AdminOrganizations } from "@/components/admin/organizations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Only allow yasirubandaraprivate@gmail.com to access admin page
  const isAuthorized = user?.email === "yasirubandaraprivate@gmail.com";
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAuthorized) {
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
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
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
        </Tabs>
      </div>
    </Layout>
  );
}
