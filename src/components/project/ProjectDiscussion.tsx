
import React, { useState } from "react";
import { Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectDiscussionProps {
  project: Project;
}

export function ProjectDiscussion({ project }: ProjectDiscussionProps) {
  const [comment, setComment] = useState("");
  const { user, userProfile } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would submit the comment to the database
    console.log("Comment submitted:", comment);
    setComment("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Discussion</h2>
          
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {userProfile?.name?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add to the discussion..."
                  className="flex-1"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={comment.trim() === ""}>Post Comment</Button>
              </div>
            </form>
          ) : (
            <p className="text-muted-foreground">Please log in to join the discussion.</p>
          )}
          
          <div className="mt-8">
            <p className="text-muted-foreground text-center italic">No comments yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
