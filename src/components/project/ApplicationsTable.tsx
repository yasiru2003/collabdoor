
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Check, X } from "lucide-react";
import { ApplicationWithProfile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApplicationsTableProps {
  applications: ApplicationWithProfile[] | undefined;
  handleUpdateApplicationStatus: (
    applicationId: string,
    status: "approved" | "rejected"
  ) => Promise<void>;
  handleMessageApplicant: (applicantId: string, applicantName: string) => void;
}

export function ApplicationsTable({
  applications,
  handleUpdateApplicationStatus,
  handleMessageApplicant,
}: ApplicationsTableProps) {
  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Manage partner applications for your project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <h3 className="text-lg font-medium">No Applications Yet</h3>
            <p className="text-muted-foreground mt-1">
              When partners apply to join your project, their applications will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>
          {applications.length} partner{applications.length > 1 ? "s" : ""} have applied to join your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Partnership Type</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const profileData = application.profile || application.profiles;
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profileData?.profile_image || undefined} />
                          <AvatarFallback>
                            {profileData?.name?.substring(0, 2).toUpperCase() || "UN"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{profileData?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{profileData?.email || "No email"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {application.partnership_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.organization_name ? (
                        <span>{application.organization_name}</span>
                      ) : (
                        <span className="text-muted-foreground">Individual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          application.status === "approved" ? "success" :
                          application.status === "rejected" ? "destructive" :
                          "outline"
                        }
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {application.status === "pending" && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleMessageApplicant(
                                application.user_id, 
                                profileData?.name || "Applicant"
                              )}
                              title="Message applicant"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon"
                              variant="outline"
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleUpdateApplicationStatus(
                                application.id, 
                                "approved"
                              )}
                              title="Approve application"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon"
                              variant="outline"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleUpdateApplicationStatus(
                                application.id, 
                                "rejected"
                              )}
                              title="Reject application"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {application.status !== "pending" && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleMessageApplicant(
                              application.user_id,
                              profileData?.name || "Applicant"
                            )}
                            title="Message applicant"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
