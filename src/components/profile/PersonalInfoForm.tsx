
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalInfoFormProps {
  name: string;
  email: string;
  bio: string;
  skills: string[];
  newSkill: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onNewSkillChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  onSubmit: () => void;
}

export function PersonalInfoForm({
  name,
  email,
  bio,
  skills,
  newSkill,
  loading,
  onNameChange,
  onBioChange,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  onSubmit
}: PersonalInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => onNameChange(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                disabled={true}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => onBioChange(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div key={skill} className="bg-muted px-3 py-1 rounded text-sm flex items-center">
                  {skill}
                  <button 
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => onRemoveSkill(skill)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSkill}
                onChange={(e) => onNewSkillChange(e.target.value)}
                placeholder="Add a new skill"
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={onAddSkill}
                disabled={loading}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
