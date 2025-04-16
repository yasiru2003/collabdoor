import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setProfileImage(user.profile_image || null);
    }
  }, [user]);

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

  // Use the correct role value that matches our defined type
  const tempUser = {
    id: "123",
    name: "John Doe",
    email: "john@example.com",
    role: "partner", // Changed from "user" to "partner"
    profile_image: "/placeholder.svg",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    skills: ["React", "TypeScript", "Node.js"],
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture Section */}
          <div>
            <Label htmlFor="profile-image">Profile Picture</Label>
            <div className="mt-2 flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileImage || tempUser.profile_image || "/placeholder.svg"} alt="Profile Image" />
                <AvatarFallback>{tempUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change</Button>
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
