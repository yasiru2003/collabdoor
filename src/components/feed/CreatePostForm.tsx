
import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/utils/upload-utils";
import { 
  MapPin, Send, Building, Image, X, Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [taggedOrganizations, setTaggedOrganizations] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch all organizations for tagging
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  
  React.useEffect(() => {
    const fetchAllOrgs = async () => {
      setIsLoadingOrgs(true);
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name, logo")
          .order("name", { ascending: true });
          
        if (error) throw error;
        setAllOrganizations(data || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast({
          title: "Error",
          description: "Failed to load organizations for tagging.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    
    fetchAllOrgs();
  }, [toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const toggleTaggedOrg = (orgId: string) => {
    if (taggedOrganizations.includes(orgId)) {
      setTaggedOrganizations(taggedOrganizations.filter(id => id !== orgId));
    } else {
      setTaggedOrganizations([...taggedOrganizations, orgId]);
    }
  };
  
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      if (!user || !content.trim()) return;
      
      try {
        setIsUploading(true);
        let imageUrl = null;
        
        // Upload image if there's one
        if (imageFile) {
          imageUrl = await uploadImage(imageFile, 'organizations', user.id);
          if (!imageUrl) {
            throw new Error("Failed to upload image");
          }
        }
        
        const postData = {
          user_id: user.id,
          content: content.trim(),
          location: location.trim() || null,
          image_url: imageUrl,
          tagged_organizations: taggedOrganizations.length > 0 ? taggedOrganizations : null
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
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      setContent("");
      setLocation("");
      setSelectedOrgId(null);
      setImageFile(null);
      setImagePreview(null);
      setTaggedOrganizations([]);
      
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
          <Avatar className="hidden sm:block">
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
            
            {imagePreview && (
              <div className="relative mt-3 rounded-lg overflow-hidden border max-w-xs">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-60 object-cover" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 rounded-full h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={handleFileSelect}
                className="flex items-center gap-1"
              >
                <Image className="h-4 w-4 text-muted-foreground" />
                Add Image
              </Button>
              
              <div className="flex items-center border rounded-md px-2 min-w-32 sm:min-w-60">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Add your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Tag Organizations
                    {taggedOrganizations.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {taggedOrganizations.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <h4 className="font-medium mb-2">Tag Organizations</h4>
                  {isLoadingOrgs ? (
                    <p className="text-sm text-muted-foreground">Loading organizations...</p>
                  ) : allOrganizations.length > 0 ? (
                    <ScrollArea className="h-60">
                      <div className="space-y-2">
                        {allOrganizations.map((org) => (
                          <div key={org.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`org-${org.id}`} 
                              checked={taggedOrganizations.includes(org.id)} 
                              onCheckedChange={() => toggleTaggedOrg(org.id)}
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={org.logo || ""} />
                              <AvatarFallback>
                                {org.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <label 
                              htmlFor={`org-${org.id}`}
                              className="text-sm flex-1 cursor-pointer"
                            >
                              {org.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground">No organizations found</p>
                  )}
                </PopoverContent>
              </Popover>
              
              {userOrganizations.length > 0 && (
                <Select 
                  value={selectedOrgId || ""} 
                  onValueChange={(value) => setSelectedOrgId(value || null)}
                >
                  <SelectTrigger className="min-w-32 sm:min-w-60 h-9">
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
            
            {taggedOrganizations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {taggedOrganizations.map((orgId) => {
                  const org = allOrganizations.find(o => o.id === orgId);
                  return org ? (
                    <Badge key={orgId} variant="secondary" className="flex items-center gap-1">
                      {org.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleTaggedOrg(orgId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          className="gap-2" 
          onClick={() => createPost()} 
          disabled={isPending || isUploading || !content.trim()}
        >
          {(isPending || isUploading) ? (
            <>
              <span className="animate-spin">⚪</span>
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
