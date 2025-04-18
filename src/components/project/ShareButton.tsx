
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Share2, Facebook, Linkedin, Mail, WhatsApp } from "lucide-react";

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");
  
  const shareLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: WhatsApp,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10">
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="grid gap-2">
          {shareLinks.map((link) => (
            <Button
              key={link.name}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.open(link.url, "_blank")}
            >
              <link.icon className="mr-2 h-4 w-4" />
              Share on {link.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
