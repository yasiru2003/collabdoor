
// For this file, I'll add a new function to get active projects only for the explore tab

/**
 * Hook to fetch all active (non-completed) projects
 * This is used for the explore tab to only show active projects
 */
export function useActiveProjects() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["activeProjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_organizer_id_fkey(id, name, email)
        `)
        .neq("status", "completed")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active projects:", error);
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Map the raw data to Project objects
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        organizerId: project.organizer_id,
        organizerName: project.profiles?.name || "Unknown",
        organizationId: project.organization_id,
        organizationName: project.organization_name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        image: project.image,
        location: project.location,
        startDate: project.start_date,
        endDate: project.end_date,
        requiredSkills: project.required_skills,
        partnershipTypes: project.partnership_types,
        category: project.category,
        applicationsEnabled: project.applications_enabled
      })) || [];
    }
  });
}
