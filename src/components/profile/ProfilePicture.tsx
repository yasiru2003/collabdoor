
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    setUploading(true);

    try {
      // Check if the storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileBucket = buckets?.find(bucket => bucket.name === 'profiles');
      
      if (!profileBucket) {
        await supabase.storage.createBucket('profiles', {
          public: true
        });
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      
      if (data) {
        onUpdate(data.publicUrl);
        toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onRemove}
            disabled={loading || uploading || !profileImage}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
