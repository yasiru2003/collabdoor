
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfilePictureProps {
  name: string;
  profileImage: string;
  loading: boolean;
  onRemove: () => void;
}

export function ProfilePicture({ name, profileImage, loading, onRemove }: ProfilePictureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload a profile image</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Avatar className="w-32 h-32 mb-4">
          <AvatarImage src={profileImage} alt={name} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {name ? name.substring(0, 2).toUpperCase() : "U"}
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
            onClick={onRemove}
            disabled={loading || !profileImage}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
