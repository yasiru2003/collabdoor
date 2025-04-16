
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Send, Building 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
  logo?: string;
}

interface CreatePostFormProps {
  userOrganizations: Organization[];
}

export function CreatePostForm({ userOrganizations }: CreatePostFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      if (!user || !content.trim()) return;
      
      try {
        const postData = {
          user_id: user.id,
          content: content.trim(),
          location: location.trim() || null
        };
        
        // Only add organization_id if one is selected
        if (selectedOrgId) {
          Object.assign(postData, { organization_id: selectedOrgId });
        }
        
        const { data, error } = await supabase
          .from("feed_posts")
          .insert(postData)
          .select();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setContent("");
      setLocation("");
      setSelectedOrgId(null);
      
      toast({
        title: "Post created",
        description: "Your post has been shared successfully!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
      console.error("Post creation error:", error);
    }
  });
  
  if (!user) return null;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.profile_image || ""} />
            <AvatarFallback>
              {user?.email?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your thoughts with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center border rounded-md px-2 min-w-60">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Add your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {userOrganizations.length > 0 && (
                <Select 
                  value={selectedOrgId || ""} 
                  onValueChange={(value) => setSelectedOrgId(value || null)}
                >
                  <SelectTrigger className="w-full md:w-60 h-9">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Post as organization" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      Post as yourself
                    </SelectItem>
                    {userOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center">
                          <span>{org.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          className="gap-2" 
          onClick={() => createPost()} 
          disabled={isPending || !content.trim()}
        >
          <Send className="h-4 w-4" />
          Post
        </Button>
      </CardFooter>
    </Card>
  );
}
