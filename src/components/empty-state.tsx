
import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  action?: ReactNode; // Add optional action prop
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <div className="text-muted-foreground max-w-md mb-4">
        {description}
      </div>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
