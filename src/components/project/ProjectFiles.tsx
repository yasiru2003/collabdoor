
import React from "react";
import { Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ProjectFilesProps {
  project: Project;
}

export function ProjectFiles({ project }: ProjectFilesProps) {
  const { user } = useAuth();
  // Fix: Use organizerId instead of owner_id
  const isOwner = user && project.organizerId === user.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Files</h2>
        {isOwner && (
          <Button size="sm">
            <FileUp className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {isOwner 
              ? "Upload project documents, images, or other files to share with your team."
              : "No files have been shared for this project yet."}
          </p>
          
          {isOwner && (
            <Button className="mt-6" variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
