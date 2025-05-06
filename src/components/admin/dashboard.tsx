
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, BarChart, ResponsiveContainer, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, FileText, MessagesSquare, Info } from "lucide-react";

export function AdminDashboard() {
  // Query to get counts of various entities
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount, error: usersError },
        { count: organizationsCount, error: orgsError },
        { count: projectsCount, error: projectsError },
        { count: messagesCount, error: messagesError }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("organizations").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
      ]);
      
      if (usersError || orgsError || projectsError || messagesError) {
        throw new Error("Failed to fetch admin statistics");
      }
      
      return {
        users: usersCount || 0,
        organizations: organizationsCount || 0,
        projects: projectsCount || 0,
        messages: messagesCount || 0
      };
    }
  });
  
  // Mock data for charts - in a real app, you'd fetch this from Supabase
  const userActivityData = [
    { name: "Jan", users: 4 },
    { name: "Feb", users: 10 },
    { name: "Mar", users: 15 },
    { name: "Apr", users: 22 },
    { name: "May", users: 28 },
    { name: "Jun", users: 35 },
  ];
  
  const projectsData = [
    { name: "Draft", count: 8 },
    { name: "Active", count: 12 },
    { name: "Completed", count: 5 },
    { name: "Cancelled", count: 2 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.users}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.organizations}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.projects}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessagesSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.messages}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>User registration over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Tabs defaultValue="line">
              <TabsList className="mb-4">
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
                <TabsTrigger value="explain">
                  <Info className="h-4 w-4 mr-2" />
                  Explain
                </TabsTrigger>
              </TabsList>
              <TabsContent value="line" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="bar" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="explain" className="h-64">
                <div className="p-4 border rounded-lg bg-muted/30 h-full overflow-y-auto">
                  <h4 className="font-medium mb-2">Understanding User Growth Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    This chart visualizes new user registration trends over time. The data shows:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Monthly Growth:</strong> The chart displays user growth on a month-by-month basis</li>
                    <li>• <strong>Trend Analysis:</strong> Use this to identify seasonal patterns or marketing impact</li>
                    <li>• <strong>Data Sources:</strong> Numbers represent new registrations from the users table</li>
                    <li>• <strong>Visualization Options:</strong> Toggle between line (trends) and bar (comparisons) views</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of project statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
