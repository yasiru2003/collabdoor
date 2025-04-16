
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ProfilePicture } from "./ProfilePicture";
import { OrganizationForm } from "./OrganizationForm";
import { AccountSettings } from "./AccountSettings";

interface ProfileTabsProps {
  name: string;
  email: string;
  bio: string;
  skills: string[];
  profileImage: string;
  newSkill: string;
  loading: boolean;
  organization: {
    name: string;
    description: string;
    industry: string;
    location: string;
    website: string;
    size: string;
    foundedYear: string;
    logo: string;
  };
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onProfileImageRemove: () => void;
  onProfileImageUpdate: (url: string) => void; // Added this prop
  onNewSkillChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  onUpdateProfile: () => void;
  onOrganizationChange: (field: string, value: string) => void;
  onUpdateOrganization: () => void;
}

export function ProfileTabs({
  name,
  email,
  bio,
  skills,
  profileImage,
  newSkill,
  loading,
  organization,
  onNameChange,
  onBioChange,
  onProfileImageRemove,
  onProfileImageUpdate, // Add this prop
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  onUpdateProfile,
  onOrganizationChange,
  onUpdateOrganization
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="personal">
      <TabsList className="mb-8">
        <TabsTrigger value="personal">Personal Information</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="account">Account Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PersonalInfoForm 
              name={name}
              email={email}
              bio={bio}
              skills={skills}
              newSkill={newSkill}
              loading={loading}
              onNameChange={onNameChange}
              onBioChange={onBioChange}
              onNewSkillChange={onNewSkillChange}
              onAddSkill={onAddSkill}
              onRemoveSkill={onRemoveSkill}
              onSubmit={onUpdateProfile}
            />
          </div>
          <div>
            <ProfilePicture 
              name={name}
              profileImage={profileImage}
              loading={loading}
              onRemove={onProfileImageRemove}
              onUpdate={onProfileImageUpdate} // Add the onUpdate prop
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="organization">
        <OrganizationForm 
          organization={organization}
          loading={loading}
          onOrganizationChange={onOrganizationChange}
          onSubmit={onUpdateOrganization}
        />
      </TabsContent>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
    </Tabs>
  );
}
