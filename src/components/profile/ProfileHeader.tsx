
import React from "react";

interface ProfileHeaderProps {
  title: string;
  description: string;
}

export function ProfileHeader({ title, description }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
