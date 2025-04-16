
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { uploadImage, removeImage } from "@/utils/upload-utils";
import { Loader2 } from "lucide-react";

interface ProfilePictureProps {
  name: string;
  profileImage: string;
  loading: boolean;
  onRemove: () => void;
  onUpdate: (url: string) => void;
}

export function ProfilePicture({ name, profileImage, loading, onRemove, onUpdate }: ProfilePictureProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }

    const file = e.target.files[0];
    setUploading(true);
    setError(null);

    try {
      console.log("Starting profile image upload...");
      // Remove old image if it exists
      if (profileImage) {
        await removeImage(profileImage, 'profiles');
      }

      // Upload new image
      const imageUrl = await uploadImage(file, 'profiles', user.id);
      
      if (imageUrl) {
        onUpdate(imageUrl);
        toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully."
        });
      } else {
        throw new Error("Failed to upload image. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during upload");
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (profileImage) {
      setUploading(true);
      setError(null);
      try {
        await removeImage(profileImage, 'profiles');
        onRemove();
        toast({
          title: "Profile image removed",
          description: "Your profile image has been removed successfully."
        });
      } catch (error: any) {
        setError(error.message || "An error occurred while removing the image");
        toast({
          title: "Remove failed",
          description: error.message || "An error occurred while removing the image",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }
  };

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

        {error && (
          <div className="text-sm text-destructive mb-2">
            {error}
          </div>
        )}

        <div className="space-y-2 w-full">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="w-full"
            disabled={loading || uploading}
            onClick={handleUploadClick}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : "Upload Image"}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={handleRemove}
            disabled={loading || uploading || !profileImage}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
