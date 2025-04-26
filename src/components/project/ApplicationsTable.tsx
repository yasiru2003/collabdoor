
import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Check, X, Mail, MoreHorizontal } from "lucide-react";
import { ApplicationWithProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ApplicationsTableProps {
  applications: ApplicationWithProfile[];
  handleUpdateApplicationStatus: (applicationId: string, status: "approved" | "rejected") => Promise<void>;
  handleMessageApplicant: (applicantId: string, applicantName: string) => void;
}

export function ApplicationsTable({
  applications = [],
  handleUpdateApplicationStatus,
  handleMessageApplicant,
}: ApplicationsTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            No applications have been submitted yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleApprove = async (applicationId: string) => {
    setLoading((prev) => ({ ...prev, [applicationId]: true }));
    await handleUpdateApplicationStatus(applicationId, "approved");
    setLoading((prev) => ({ ...prev, [applicationId]: false }));
  };

  const handleReject = async (applicationId: string) => {
    setLoading((prev) => ({ ...prev, [applicationId]: true }));
    await handleUpdateApplicationStatus(applicationId, "rejected");
    setLoading((prev) => ({ ...prev, [applicationId]: false }));
  };

  const handleMessage = (application: ApplicationWithProfile) => {
    // Get profile information, checking both profile and profiles properties
    const profileData = application.profile || application.profiles;
    const applicantId = application.user_id;
    const applicantName = profileData?.name || "Applicant";
    handleMessageApplicant(applicantId, applicantName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Applications</CardTitle>
        <CardDescription>
          Review and manage applications for your project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Applicant</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Organization</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => {
              // Get profile information, checking both profile and profiles properties
              const profileData = application.profile || application.profiles;
              return (
                <TableRow
                  key={application.id}
                  className={expanded === application.id ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profileData?.profile_image || ""} alt={profileData?.name} />
                        <AvatarFallback>{profileData?.name?.charAt(0) || "A"}</AvatarFallback>
                      </Avatar>
                      <span>{profileData?.name || "Unknown Applicant"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{application.partnership_type || "Not specified"}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {application.organization_name ? (
                      <span>{application.organization_name}</span>
                    ) : (
                      <span className="text-muted-foreground">Individual</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {application.created_at ? format(new Date(application.created_at), "MMM d, yyyy") : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        application.status === "approved"
                          ? "success"
                          : application.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleExpand(application.id)}
                      >
                        {expanded === application.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleMessage(application)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {application.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(application.id)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(application.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
