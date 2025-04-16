
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [] as string[],
    profileImage: "",
  });
  const [organization, setOrganization] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    website: "",
    size: "",
    foundedYear: "",
    logo: "",
  });
  const [newSkill, setNewSkill] = useState("");

  // Fetch user and profile data
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return;
        }

        setUser({
          id: user.id,
          email: user.email || "",
          name: "",
          role: "partner"
        });

        // Fetch profile from database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        if (profileData) {
          setProfile({
            name: profileData.name || "",
            email: profileData.email,
            bio: profileData.bio || "",
            skills: profileData.skills || [],
            profileImage: profileData.profile_image || "",
          });
          
          // Set user data with role from profile
          setUser(prev => prev ? {
            ...prev,
            name: profileData.name || "",
            role: profileData.role as "partner" | "organizer",
          } : null);
        }

        // Fetch organization if exists
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (orgError && orgError.code !== 'PGRST116') {
          console.error("Error fetching organization:", orgError);
        }

        if (orgData) {
          setOrganization({
            name: orgData.name || "",
            description: orgData.description || "",
            industry: orgData.industry || "",
            location: orgData.location || "",
            website: orgData.website || "",
            size: orgData.size || "",
            foundedYear: orgData.founded_year ? orgData.founded_year.toString() : "",
            logo: orgData.logo || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [toast]);

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          bio: profile.bio,
          skills: profile.skills,
          profile_image: profile.profileImage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update organization
  const handleUpdateOrganization = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Check if organization exists
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (orgError && orgError.code !== 'PGRST116') {
        throw orgError;
      }

      const foundedYear = organization.foundedYear ? parseInt(organization.foundedYear) : null;

      if (orgData) {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: organization.name,
            description: organization.description,
            industry: organization.industry,
            location: organization.location,
            website: organization.website,
            size: organization.size,
            founded_year: foundedYear,
            logo: organization.logo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orgData.id);

        if (error) throw error;
      } else {
        // Create new organization
        const { error } = await supabase
          .from('organizations')
          .insert({
            owner_id: user.id,
            name: organization.name,
            description: organization.description,
            industry: organization.industry,
            location: organization.location,
            website: organization.website,
            size: organization.size,
            founded_year: foundedYear,
            logo: organization.logo,
          });

        if (error) throw error;
      }

      toast({
        title: "Organization updated",
        description: "Your organization has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error updating organization",
        description: "There was a problem updating your organization.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manage skills
  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleOrganizationChange = (field: string, value: string) => {
    setOrganization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveProfileImage = () => {
    setProfile({
      ...profile,
      profileImage: ""
    });
  };

  return (
    <Layout>
      <ProfileHeader 
        title="Profile" 
        description="Manage your personal information and organization details" 
      />
      
      <ProfileTabs 
        name={profile.name}
        email={profile.email}
        bio={profile.bio}
        skills={profile.skills}
        profileImage={profile.profileImage}
        newSkill={newSkill}
        loading={loading}
        organization={organization}
        onNameChange={(value) => setProfile({...profile, name: value})}
        onBioChange={(value) => setProfile({...profile, bio: value})}
        onProfileImageRemove={handleRemoveProfileImage}
        onNewSkillChange={setNewSkill}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        onUpdateProfile={handleUpdateProfile}
        onOrganizationChange={handleOrganizationChange}
        onUpdateOrganization={handleUpdateOrganization}
      />
    </Layout>
  );
}
