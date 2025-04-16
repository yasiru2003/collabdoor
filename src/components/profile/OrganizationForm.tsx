
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { uploadImage, removeImage } from "@/utils/upload-utils";
import { Loader2 } from "lucide-react";

interface OrganizationFormProps {
  organization: {
    name: string;
    description: string;
    industry: string;
    location: string;
    website: string;
    size: string;
    foundedYear: string;
    logo: string;
  };
  loading: boolean;
  onOrganizationChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export function OrganizationForm({
  organization,
  loading,
  onOrganizationChange,
  onSubmit
}: OrganizationFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }

    const file = e.target.files[0];
    setUploading(true);
    setError(null);

    try {
      console.log("Starting organization logo upload...");
      // Remove old logo if it exists
      if (organization.logo) {
        await removeImage(organization.logo, 'organizations');
      }

      // Upload new logo
      const logoUrl = await uploadImage(file, 'organizations', user.id);
      
      if (logoUrl) {
        onOrganizationChange('logo', logoUrl);
        toast({
          title: "Organization logo updated",
          description: "Your organization logo has been updated successfully."
        });
      } else {
        throw new Error("Failed to upload logo. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during upload");
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (organization.logo) {
      setUploading(true);
      setError(null);
      try {
        await removeImage(organization.logo, 'organizations');
        onOrganizationChange('logo', '');
        toast({
          title: "Logo removed",
          description: "Your organization logo has been removed successfully."
        });
      } catch (error: any) {
        setError(error.message || "An error occurred while removing the logo");
        toast({
          title: "Remove failed",
          description: error.message || "An error occurred while removing the logo",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Information</CardTitle>
        <CardDescription>Add or update your organization details</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input 
                id="org-name" 
                value={organization.name}
                onChange={(e) => onOrganizationChange("name", e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={organization.industry || ""}
                onValueChange={(value) => onOrganizationChange("industry", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="financial">Financial Services</SelectItem>
                  <SelectItem value="nonprofit">Nonprofit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={organization.location}
                onChange={(e) => onOrganizationChange("location", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                type="url" 
                placeholder="https://" 
                value={organization.website}
                onChange={(e) => onOrganizationChange("website", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Organization Size</Label>
              <Select 
                value={organization.size || ""} 
                onValueChange={(value) => onOrganizationChange("size", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501+">501+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded">Founded Year</Label>
              <Input 
                id="founded" 
                type="number" 
                min="1900" 
                max="2025" 
                value={organization.foundedYear}
                onChange={(e) => onOrganizationChange("foundedYear", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              rows={4} 
              value={organization.description}
              onChange={(e) => onOrganizationChange("description", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 border rounded flex items-center justify-center bg-muted overflow-hidden">
                {organization.logo ? (
                  <img src={organization.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">No Logo</span>
                )}
              </div>
              <div className="space-y-2">
                {error && (
                  <div className="text-sm text-destructive">
                    {error}
                  </div>
                )}
                <input 
                  type="file" 
                  id="logo"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  variant="outline"
                  disabled={loading || uploading}
                  onClick={handleUploadClick}
                  type="button"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : "Upload Logo"}
                </Button>
                {organization.logo && (
                  <Button 
                    variant="ghost"
                    disabled={loading || uploading}
                    onClick={handleRemoveLogo}
                    type="button"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Organization"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
