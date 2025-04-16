
import { useState } from "react";
import { Layout } from "@/components/layout";
import { PartnerCard } from "@/components/partner-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePartners, usePartnerships } from "@/hooks/use-supabase-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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
  const [sizeFilter, setSizeFilter] = useState("all");
  const { user } = useAuth();
  
  // Fetch partners data
  const { data: partners, isLoading: partnersLoading } = usePartners();
  
  // Fetch partnerships data
  const { data: partnerships, isLoading: partnershipsLoading } = usePartnerships(user?.id);

  // Filter and search organizations
  const filteredOrganizations = partners?.filter(org => {
    // Exclude user's own organizations
    if (user && org.owner_id === user.id) {
      return false;
    }
    
    // Search filter
    const matchesSearch = 
      !searchQuery || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (org.industry && org.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Industry filter
    const matchesIndustry = 
      industryFilter === "all" || 
      org.industry === industryFilter;
    
    // Location filter
    const matchesLocation = 
      locationFilter === "all" || 
      org.location === locationFilter;
    
    // Size filter
    const matchesSize =
      sizeFilter === "all" ||
      org.size === sizeFilter;
    
    return matchesSearch && matchesIndustry && matchesLocation && matchesSize;
  }) || [];

  // Get skills based on organization industry
  const getSkillsForOrganization = (organization: any) => {
    if (!organization.industry) return defaultSkills;
    return industrySkills[organization.industry] || defaultSkills;
  };

  // Find active partnerships
  const activePartnerships = partnerships?.filter(p => p.status === 'active') || [];
  
  // Find requested partnerships
  const requestedPartnerships = partnerships?.filter(p => p.status === 'pending') || [];
  
  // Find past partnerships
  const pastPartnerships = partnerships?.filter(p => p.status === 'completed') || [];

  const isLoading = partnersLoading || partnershipsLoading;

  const renderPartnershipTable = (partnershipsList: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partnershipsList.length > 0 ? (
          partnershipsList.map((partnership) => (
            <TableRow key={partnership.id}>
              <TableCell className="font-medium">{partnership.organization?.name || "Unknown Organization"}</TableCell>
              <TableCell>{partnership.project?.title || "Unknown Project"}</TableCell>
              <TableCell>{partnership.partnership_type}</TableCell>
              <TableCell>{partnership.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No partnerships found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Partners</h1>
          <p className="text-muted-foreground">Manage partnership relationships</p>
        </div>
      </div>

      <Tabs defaultValue="explore" className="mb-6">
        <TabsList>
          <TabsTrigger value="explore">Partner Directory</TabsTrigger>
          <TabsTrigger value="requested">Requested Partners</TabsTrigger>
          <TabsTrigger value="connected">Active Partners</TabsTrigger>
          <TabsTrigger value="past">Past Partners</TabsTrigger>
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
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
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
              <SelectTrigger className="w-full md:w-[160px]">
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
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Organization Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201+">201+ employees</SelectItem>
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

        <TabsContent value="requested" className="mt-0">
          {isLoading ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(requestedPartnerships)
          )}
        </TabsContent>

        <TabsContent value="connected" className="mt-0">
          {isLoading ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(activePartnerships)
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          {isLoading ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(pastPartnerships)
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
