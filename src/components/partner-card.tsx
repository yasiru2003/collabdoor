
import { Organization, PartnershipType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Building, ExternalLink, MapPin, Users, Mail, Handshake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface PartnerCardProps {
  organization: Organization;
  partnershipInterests?: PartnershipType[];
}

// Partnership type label mapping
const partnershipTypeLabels: Record<PartnershipType, string> = {
  'monetary': 'Financial Support',
  'knowledge': 'Knowledge Sharing',
  'skilled': 'Skilled Professionals',
  'volunteering': 'Volunteering'
};

// Partnership type color mapping
const partnershipTypeColors: Record<PartnershipType, string> = {
  'monetary': 'bg-green-100 text-green-800',
  'knowledge': 'bg-blue-100 text-blue-800',
  'skilled': 'bg-purple-100 text-purple-800',
  'volunteering': 'bg-amber-100 text-amber-800',
};

export function PartnerCard({ organization, partnershipInterests }: PartnerCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if current user is the organization owner
  const isOwner = user && user.id === organization.owner_id;

  // Handle contact button click to message organization owner
  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnTo: `/organizations/${organization.id}` } });
      return;
    }
    
    // Navigate to messages with the organization owner info
    navigate("/messages", { 
      state: { 
        participantId: organization.owner_id,
        participantName: organization.name
      } 
    });
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={organization.logo} alt={organization.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {organization.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              <Link to={`/organizations/${organization.id}`} className="hover:text-primary transition-colors">
                {organization.name}
              </Link>
            </CardTitle>
            {organization.industry && (
              <CardDescription>
                {organization.industry}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm mb-4 line-clamp-3">
          {organization.description || "No description provided."}
        </p>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {organization.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{organization.location}</span>
            </div>
          )}
          {organization.size && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{organization.size}</span>
            </div>
          )}
          {organization.industry && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{organization.industry}</span>
            </div>
          )}
        </div>
        
        {partnershipInterests && partnershipInterests.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2 text-sm">
              <Handshake className="h-4 w-4" />
              <span>Partnership Interests:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {partnershipInterests.map((type) => (
                <Badge 
                  key={type} 
                  variant="outline"
                  className={partnershipTypeColors[type]}
                >
                  {partnershipTypeLabels[type]}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        {organization.website ? (
          <a 
            href={organization.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Website</span>
          </a>
        ) : (
          <span></span>
        )}
        {!isOwner && user && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleContact}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
