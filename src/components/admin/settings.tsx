
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newLocationName, setNewLocationName] = useState("");
  const [newPartnershipType, setNewPartnershipType] = useState("");

  // Query for locations
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations
  } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Query for partnership types
  const { 
    data: partnershipTypes = [], 
    isLoading: isLoadingPartnershipTypes
  } = useQuery({
    queryKey: ["admin-partnership-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_types")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation for adding a new location
  const addLocationMutation = useMutation({
    mutationFn: async (locationName: string) => {
      const { data, error } = await supabase
        .from("locations")
        .insert({ name: locationName })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      setNewLocationName("");
      toast({
        title: "Location added",
        description: "The new location has been added successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding location",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for adding a new partnership type
  const addPartnershipTypeMutation = useMutation({
    mutationFn: async (typeName: string) => {
      const { data, error } = await supabase
        .from("partnership_types")
        .insert({ name: typeName })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partnership-types"] });
      setNewPartnershipType("");
      toast({
        title: "Partnership type added",
        description: "The new partnership type has been added successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding partnership type",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting a location
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast({
        title: "Location deleted",
        description: "The location has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting location",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting a partnership type
  const deletePartnershipTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("partnership_types")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partnership-types"] });
      toast({
        title: "Partnership type deleted",
        description: "The partnership type has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting partnership type",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      addLocationMutation.mutate(newLocationName.trim());
    }
  };

  const handleAddPartnershipType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPartnershipType.trim()) {
      addPartnershipTypeMutation.mutate(newPartnershipType.trim());
    }
  };

  const handleDeleteLocation = (id: string) => {
    deleteLocationMutation.mutate(id);
  };

  const handleDeletePartnershipType = (id: string) => {
    deletePartnershipTypeMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="locations" className="w-full">
        <TabsList>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="partnership-types">Partnership Types</TabsTrigger>
          <TabsTrigger value="approval-settings">Approval Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Locations</CardTitle>
              <CardDescription>
                Add or remove locations that users can select for projects and organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddLocation} className="flex gap-2">
                <Input
                  placeholder="Enter new location name"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!newLocationName.trim() || addLocationMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Location
                </Button>
              </form>

              <Separator className="my-4" />

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingLocations ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">Loading locations...</TableCell>
                      </TableRow>
                    ) : locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">No locations found</TableCell>
                      </TableRow>
                    ) : (
                      locations.map((location: any) => (
                        <TableRow key={location.id}>
                          <TableCell>{location.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocation(location.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnership-types" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Partnership Types</CardTitle>
              <CardDescription>
                Add or remove partnership types that can be used in projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddPartnershipType} className="flex gap-2">
                <Input
                  placeholder="Enter new partnership type"
                  value={newPartnershipType}
                  onChange={(e) => setNewPartnershipType(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!newPartnershipType.trim() || addPartnershipTypeMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Type
                </Button>
              </form>

              <Separator className="my-4" />

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPartnershipTypes ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">Loading partnership types...</TableCell>
                      </TableRow>
                    ) : partnershipTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">No partnership types found</TableCell>
                      </TableRow>
                    ) : (
                      partnershipTypes.map((type: any) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePartnershipType(type.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval-settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Settings</CardTitle>
              <CardDescription>
                Configure auto-approval settings for organizations and projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Auto-approve new organizations</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve new organization creation requests
                  </p>
                </div>
                <Button variant="outline">
                  <Badge variant="outline" className="mr-2">ON</Badge>
                  Enabled
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Auto-approve project publications</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve new project publication requests
                  </p>
                </div>
                <Button variant="outline">
                  <Badge variant="outline" className="mr-2">ON</Badge>
                  Enabled
                </Button>
              </div>

              <div className="mt-6">
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
