
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
              <div className="h-16 w-16 border rounded flex items-center justify-center bg-muted">
                {organization.logo ? (
                  <img src={organization.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  "Logo"
                )}
              </div>
              <Button 
                variant="outline"
                disabled={loading}
              >
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Organization"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
