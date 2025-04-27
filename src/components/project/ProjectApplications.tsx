
import React, { useState } from "react";
import { useProjectApplications } from "@/hooks/use-applications-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface ProjectApplicationsProps {
  projectId: string;
}

export function ProjectApplications({ projectId }: ProjectApplicationsProps) {
  const { applications, isLoading, refetch } = useProjectApplications(projectId);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateStatus = async (applicationId: string, newStatus: "approved" | "rejected") => {
    try {
      setIsUpdating(applicationId);
      // We would call a function here to update the status in the database
      console.log(`Updating application ${applicationId} to ${newStatus}`);
      // After updating, refetch the applications
      await refetch();
    } catch (error) {
      console.error("Error updating application status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p>Loading applications...</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            No one has applied to join this project yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Project Applications</h2>
      
      <Card>
        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Partnership Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={application.profiles?.profile_image || ""} />
                        <AvatarFallback>
                          {application.profiles.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.profiles.name}</p>
                        <p className="text-xs text-muted-foreground">{application.profiles.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {application.partnership_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.status === "pending" && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Clock className="h-4 w-4" />
                        <span>Pending</span>
                      </div>
                    )}
                    {application.status === "approved" && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Approved</span>
                      </div>
                    )}
                    {application.status === "rejected" && (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>Rejected</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(application.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          disabled={isUpdating === application.id}
                          onClick={() => handleUpdateStatus(application.id, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isUpdating === application.id}
                          onClick={() => handleUpdateStatus(application.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
