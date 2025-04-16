
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

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

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and organization details</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="mb-8">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profile.email} 
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <div key={skill} className="bg-muted px-3 py-1 rounded text-sm flex items-center">
                          {skill}
                          <button 
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveSkill(skill)}
                            disabled={loading}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill"
                        disabled={loading}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddSkill}
                        disabled={loading}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a profile image</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={profile.profileImage} alt={profile.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profile.name ? profile.name.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2 w-full">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={loading}
                    >
                      Upload Image
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setProfile({...profile, profileImage: ""})}
                      disabled={loading || !profile.profileImage}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Add or update your organization details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateOrganization(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input 
                      id="org-name" 
                      value={organization.name}
                      onChange={(e) => setOrganization({...organization, name: e.target.value})}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={organization.industry || ""}
                      onValueChange={(value) => setOrganization({...organization, industry: value})}
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
                      onChange={(e) => setOrganization({...organization, location: e.target.value})}
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
                      onChange={(e) => setOrganization({...organization, website: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Organization Size</Label>
                    <Select 
                      value={organization.size || ""} 
                      onValueChange={(value) => setOrganization({...organization, size: value})}
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
                      onChange={(e) => setOrganization({...organization, foundedYear: e.target.value})}
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
                    onChange={(e) => setOrganization({...organization, description: e.target.value})}
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
        </TabsContent>

        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => { 
                  e.preventDefault(); 
                  toast({
                    title: "Coming soon",
                    description: "Password change functionality will be available soon."
                  });
                }}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage your email preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Partnership Requests</h4>
                      <p className="text-sm text-muted-foreground">Get notified when someone applies to your project</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-partnership" className="rounded border-gray-300" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Project Updates</h4>
                      <p className="text-sm text-muted-foreground">Get notified about updates to projects you're involved with</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-updates" className="rounded border-gray-300" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Direct Messages</h4>
                      <p className="text-sm text-muted-foreground">Get notified when you receive a direct message</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-messages" className="rounded border-gray-300" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing</h4>
                      <p className="text-sm text-muted-foreground">Receive newsletter and promotional emails</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-marketing" className="rounded border-gray-300" />
                    </div>
                  </div>
                  
                  <Button onClick={() => {
                    toast({
                      title: "Coming soon",
                      description: "Email preferences will be available soon."
                    });
                  }}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Proceed with caution, these actions cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    toast({
                      title: "Coming soon",
                      description: "Account deletion will be available soon."
                    });
                  }}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
