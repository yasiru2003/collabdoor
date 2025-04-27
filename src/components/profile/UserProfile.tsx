import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { CalendarIcon, MapPinIcon } from "lucide-react";

interface UserProfileProps {
  profile: {
    id: string;
    name: string;
    email: string;
    profile_image?: string;
    location?: string;
    created_at?: string;
    bio?: string;
    website?: string;
  };
}

export function UserProfile({ profile }: UserProfileProps) {
  const profileCreatedAt = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "N/A";

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl font-bold">
            {profile.name} <VerifiedBadge />
          </CardTitle>
          <Button asChild>
            <Link to="/">Back to Projects</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            {/* Avatar and User Info */}
            <div className="sm:col-span-1 flex flex-col items-center sm:items-start">
              <Avatar className="h-32 w-32">
                {profile.profile_image ? (
                  <AvatarImage src={profile.profile_image} alt={profile.name} />
                ) : (
                  <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="mt-4 text-center sm:text-left">
                <p className="font-semibold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="sm:col-span-3 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">About</h3>
                <p className="text-muted-foreground">{profile.bio || "No bio provided."}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Details</h3>
                <div className="text-muted-foreground space-y-1">
                  {profile.location && (
                    <p className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Joined: {profileCreatedAt}</span>
                  </p>
                  {profile.website && (
                    <p>
                      Website:{" "}
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary hover:text-primary-foreground"
                      >
                        {profile.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
