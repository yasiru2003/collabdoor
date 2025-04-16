
import { format } from "date-fns";
import { ApplicationWithProfile } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Mail } from "lucide-react";

interface ApplicationsTableProps {
  applications: ApplicationWithProfile[] | undefined;
  handleUpdateApplicationStatus: (applicationId: string, status: "approved" | "rejected") => Promise<void>;
  handleMessageApplicant: (applicantId: string, applicantName: string) => void;
}

export function ApplicationsTable({
  applications,
  handleUpdateApplicationStatus,
  handleMessageApplicant
}: ApplicationsTableProps) {
  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Partnership Applications</CardTitle>
        <CardDescription>Review and manage applications to partner on this project</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Partnership Type</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => {
              // Extract profile data safely with proper type checks
              const hasProfileData = application && 'profiles' in application && application.profiles;
              
              // Extract profile data with safe access
              const profileImage = hasProfileData ? application.profiles?.profile_image || "" : "";
              const profileName = hasProfileData ? application.profiles?.name || "Unknown" : "Unknown";
              const profileEmail = hasProfileData ? application.profiles?.email || "" : "";
              const applicantId = application.user_id;
              
              // Only calculate initials if we have a valid name
              const initials = profileName !== "Unknown" 
                ? profileName.substring(0, 2).toUpperCase() 
                : "??";

              return (
                <TableRow key={application.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profileImage} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{profileName}</div>
                      <div className="text-xs text-muted-foreground">{profileEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {application.partnership_type.charAt(0).toUpperCase() + application.partnership_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(application.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        application.status === "approved" ? "success" : 
                        application.status === "rejected" ? "destructive" : 
                        "secondary"
                      }
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-green-700 hover:bg-green-100"
                          onClick={() => handleUpdateApplicationStatus(application.id, "approved")}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-red-700 hover:bg-red-100"
                          onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={() => handleMessageApplicant(applicantId, profileName)}
                        >
                          <Mail className="h-4 w-4 mr-1" /> Contact
                        </Button>
                      </div>
                    )}
                    {application.status !== "pending" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessageApplicant(applicantId, profileName)}
                      >
                        <Mail className="h-4 w-4 mr-1" /> Contact
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
