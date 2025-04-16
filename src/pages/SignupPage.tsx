
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignupPage() {
  const [role, setRole] = useState<UserRole>("partner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic
    console.log("Signup submitted with role:", role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="font-bold text-3xl bg-primary text-primary-foreground px-3 py-2 rounded inline-block">
              CD
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Join CollabDoor</h1>
          <p className="text-muted-foreground">Create an account to start collaborating</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Choose your role to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>

              <div className="grid gap-2">
                <Label>I want to join as a</Label>
                <Tabs defaultValue="partner" onValueChange={(v) => setRole(v as UserRole)}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="partner">Partner</TabsTrigger>
                    <TabsTrigger value="organizer">Organizer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="partner" className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      As a Partner, you can offer resources and expertise to projects.
                    </p>
                  </TabsContent>
                  <TabsContent value="organizer" className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      As an Organizer, you can create projects and find partners.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
