
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomPartnershipType {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
}

interface CustomPartnershipTypesProps {
  projectId?: string;
  onTypesChange?: (types: string[]) => void;
  existingTypes?: string[];
  className?: string;
}

export function CustomPartnershipTypes({
  projectId,
  onTypesChange,
  existingTypes = [],
  className = "",
}: CustomPartnershipTypesProps) {
  const [partnershipTypes, setPartnershipTypes] = useState<CustomPartnershipType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomPartnershipType | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load partnership types
  useEffect(() => {
    const loadPartnershipTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("partnership_types")
          .select("*")
          .order("name");

        if (error) throw error;
        setPartnershipTypes(data || []);
      } catch (error) {
        console.error("Error loading partnership types:", error);
        toast({
          title: "Error loading partnership types",
          description: "Failed to load partnership types.",
          variant: "destructive",
        });
      }
    };

    loadPartnershipTypes();
  }, [toast]);

  // Handle add/edit partnership type
  const handleSaveType = async () => {
    if (!typeName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the partnership type.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingType) {
        // Update existing type
        const { error } = await supabase
          .from("partnership_types")
          .update({
            name: typeName,
            description: typeDescription,
          })
          .eq("id", editingType.id);

        if (error) throw error;
        
        toast({
          title: "Partnership type updated",
          description: `"${typeName}" has been updated.`,
        });
      } else {
        // Create new type
        const { data, error } = await supabase
          .from("partnership_types")
          .insert({
            name: typeName,
            description: typeDescription,
            project_id: projectId,
          })
          .select();

        if (error) throw error;
        
        toast({
          title: "Partnership type added",
          description: `"${typeName}" has been added as a partnership type.`,
        });
        
        // If types are being tracked externally (e.g., in a form)
        if (onTypesChange && data) {
          const newTypes = [...existingTypes, typeName];
          onTypesChange(newTypes);
        }
      }

      // Refresh the list
      const { data: types } = await supabase
        .from("partnership_types")
        .select("*")
        .order("name");

      setPartnershipTypes(types || []);
      
      // Close dialog and reset form
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving partnership type:", error);
      toast({
        title: "Error",
        description: "Failed to save partnership type.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteType = async (type: CustomPartnershipType) => {
    if (confirm(`Are you sure you want to delete the "${type.name}" partnership type?`)) {
      try {
        const { error } = await supabase
          .from("partnership_types")
          .delete()
          .eq("id", type.id);

        if (error) throw error;
        
        // Update state
        setPartnershipTypes(partnershipTypes.filter(t => t.id !== type.id));
        
        // Update external state if needed
        if (onTypesChange) {
          const newTypes = existingTypes.filter(t => t !== type.name);
          onTypesChange(newTypes);
        }
        
        toast({
          title: "Partnership type deleted",
          description: `"${type.name}" has been removed.`,
        });
      } catch (error) {
        console.error("Error deleting partnership type:", error);
        toast({
          title: "Error",
          description: "Failed to delete partnership type.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditType = (type: CustomPartnershipType) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeDescription(type.description || "");
    setDialogOpen(true);
  };

  const handleAddNewType = () => {
    setEditingType(null);
    setTypeName("");
    setTypeDescription("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingType(null);
    setTypeName("");
    setTypeDescription("");
  };

  const handleSelectType = (type: CustomPartnershipType) => {
    if (!onTypesChange) return;
    
    // Check if already selected
    if (existingTypes.includes(type.name)) {
      const newTypes = existingTypes.filter(t => t !== type.name);
      onTypesChange(newTypes);
    } else {
      const newTypes = [...existingTypes, type.name];
      onTypesChange(newTypes);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Partnership Types</CardTitle>
              <CardDescription>
                Select existing partnership types or create custom ones
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddNewType}>
              <Plus className="h-4 w-4 mr-1" /> Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-sm">Standard Types</h4>
            <div className="flex flex-wrap gap-2">
              {["monetary", "knowledge", "skilled", "volunteering"].map((type) => (
                <Badge 
                  key={type}
                  variant={existingTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onTypesChange && handleSelectType({ id: type, name: type })}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Custom Types</h4>
            {partnershipTypes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partnershipTypes.map((type) => (
                  <div key={type.id} className="flex items-center">
                    <Badge 
                      variant={existingTypes.includes(type.name) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => onTypesChange && handleSelectType(type)}
                    >
                      {type.name}
                    </Badge>
                    
                    <div className="flex ml-1 space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleEditType(type)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive/80" 
                        onClick={() => handleDeleteType(type)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No custom partnership types available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit Partnership Type" : "Add New Partnership Type"}</DialogTitle>
            <DialogDescription>
              {editingType 
                ? "Update the details of this partnership type" 
                : "Create a custom partnership type for your project"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="typeName">Name</Label>
              <Input
                id="typeName"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="e.g., Technology Support"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="typeDescription">Description (optional)</Label>
              <Textarea
                id="typeDescription"
                value={typeDescription}
                onChange={(e) => setTypeDescription(e.target.value)}
                placeholder="Describe what this partnership type involves"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveType} disabled={isLoading}>
              {isLoading ? "Saving..." : (editingType ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
