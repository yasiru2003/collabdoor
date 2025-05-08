
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export function ProjectLoadingState() {
  return (
    <Layout>
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-muted rounded mb-4"></div>
        <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
        <div className="h-32 bg-muted rounded mb-4"></div>
      </div>
    </Layout>
  );
}

export function ProjectErrorState() {
  return (
    <Layout>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/projects">Browse Projects</Link>
        </Button>
      </div>
    </Layout>
  );
}
