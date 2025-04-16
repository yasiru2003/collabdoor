
import { Organization } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Building, ExternalLink, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

interface PartnerCardProps {
  organization: Organization;
  skills?: string[];
}

export function PartnerCard({ organization, skills = [] }: PartnerCardProps) {
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
              <Link to={`/partners/${organization.id}`} className="hover:text-primary transition-colors">
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
          {organization.description}
        </p>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="space-y-2 text-sm text-muted-foreground mt-2">
          {organization.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{organization.location}</span>
            </div>
          )}
          {organization.foundedYear && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Founded {organization.foundedYear}</span>
            </div>
          )}
          {organization.size && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{organization.size}</span>
            </div>
          )}
        </div>
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
        <Button size="sm">Contact</Button>
      </CardFooter>
    </Card>
  );
}
