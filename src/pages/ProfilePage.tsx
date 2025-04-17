
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export default function ProfilePage() {
  const { user, updateUserProfile, userProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // Set values from userProfile or user metadata
      setName(userProfile?.name || user.user_metadata?.name || "");
      setEmail(user.email || "");
      setBio(userProfile?.bio || user.user_metadata?.bio || "");
      setProfileImage(userProfile?.profile_image || user.user_metadata?.profile_image || null);
    }
  }, [user, userProfile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ name, bio, profile_image: profileImage });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 md:py-10 px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture Section */}
          <div>
            <Label htmlFor="profile-image">Profile Picture</Label>
            <div className="mt-2 flex flex-col sm:flex-row items-center sm:space-x-4">
              <Avatar className="h-20 w-20 mb-4 sm:mb-0">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile Image" />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {name ? name.substring(0, 2).toUpperCase() : user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Change</Button>
                {profileImage && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto text-destructive hover:text-destructive"
                    onClick={() => setProfileImage(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information Form */}
          <div>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
