
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ProfilePicture } from "./ProfilePicture";
import { OrganizationForm } from "./OrganizationForm";
import { AccountSettings } from "./AccountSettings";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileTabsProps {
  name: string;
  email: string;
  bio: string;
  skills: string[];
  profileImage: string;
  newSkill: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onProfileImageRemove: () => void;
  onProfileImageUpdate: (url: string) => void;
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
  onNameChange,
  onBioChange,
  onProfileImageRemove,
  onProfileImageUpdate,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  onUpdateProfile,
  onOrganizationChange,
  onUpdateOrganization
}: ProfileTabsProps) {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="personal">
      <TabsList className="mb-8 w-full flex overflow-x-auto">
        <TabsTrigger value="personal" className="flex-1 whitespace-nowrap">Personal Information</TabsTrigger>
        <TabsTrigger value="organization" className="flex-1 whitespace-nowrap">Organization</TabsTrigger>
        <TabsTrigger value="account" className="flex-1 whitespace-nowrap">Account Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isMobile && (
            <div className="lg:hidden">
              <ProfilePicture 
                name={name}
                profileImage={profileImage}
                loading={loading}
                onRemove={onProfileImageRemove}
                onUpdate={onProfileImageUpdate}
              />
            </div>
          )}
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
          {!isMobile && (
            <div className="hidden lg:block">
              <ProfilePicture 
                name={name}
                profileImage={profileImage}
                loading={loading}
                onRemove={onProfileImageRemove}
                onUpdate={onProfileImageUpdate}
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="organization">
        <OrganizationForm />
      </TabsContent>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
    </Tabs>
  );
}

