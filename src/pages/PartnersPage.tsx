import { useState } from "react";
import { Layout } from "@/components/layout";
import { PartnerCard } from "@/components/partner-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePartners } from "@/hooks/use-supabase-query";
import { Skeleton } from "@/components/ui/skeleton";

// Define industry skill mappings
const industrySkills: Record<string, string[]> = {
  "Technology": ["Software Development", "Cloud Computing", "AI", "Data Science"],
  "Healthcare": ["Medical Research", "Healthcare Management", "Telehealth", "Biotechnology"],
  "Nonprofit": ["Fundraising", "Community Outreach", "Volunteer Management", "Grant Writing"],
  "Education": ["Teaching", "EdTech", "Curriculum Development", "E-Learning"],
  "Financial Services": ["Financial Analysis", "Investment Banking", "Risk Management", "FinTech"]
};

// Default skills for organizations without a specific industry
const defaultSkills = ["Communication", "Project Management", "Leadership"];

export default function PartnersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: partners, isLoading } = usePartners();

  // Filter and search organizations
  const filteredOrganizations = partners?.filter(org => {
    // Search filter
    const matchesSearch = 
      !searchQuery || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Industry filter
    const matchesIndustry = 
      industryFilter === "all" || 
      org.industry === industryFilter;
    
    // Location filter
    const matchesLocation = 
      locationFilter === "all" || 
      org.location === locationFilter;
    
    return matchesSearch && matchesIndustry && matchesLocation;
  }) || [];

  // Get skills based on organization industry
  const getSkillsForOrganization = (organization: any) => {
    if (!organization.industry) return defaultSkills;
    return industrySkills[organization.industry] || defaultSkills;
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Partners</h1>
          <p className="text-muted-foreground">Find collaborative organizations to work with</p>
        </div>
        <Button className="gap-1 self-start">
          <Plus className="h-4 w-4" />
          <span>Add Organization</span>
        </Button>
      </div>

      <Tabs defaultValue="explore" className="mb-6">
        <TabsList>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="interested">Interested</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 my-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search partners..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Nonprofit">Nonprofit</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Financial Services">Financial Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("grid")}
                className={cn("rounded-none", viewMode === "grid" ? "bg-muted" : "")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("list")}
                className={cn("rounded-none", viewMode === "list" ? "bg-muted" : "")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="explore" className="mt-0">
          {isLoading ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredOrganizations.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredOrganizations.map((org) => (
                <PartnerCard 
                  key={org.id} 
                  organization={org} 
                  skills={getSkillsForOrganization(org)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No organizations found matching your filters.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="interested" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No organizations have shown interest yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="connected" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't connected with any organizations yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't saved any organizations yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
