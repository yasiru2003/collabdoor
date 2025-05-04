
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import PublicProjectsPage from "./pages/PublicProjectsPage";
import PublicOrganizationsPage from "./pages/PublicOrganizationsPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import PartnersPage from "./pages/PartnersPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import CreateOrganizationPage from "./pages/CreateOrganizationPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import EditOrganizationPage from "./pages/EditOrganizationPage";
import AdminPage from "./pages/AdminPage";
import FeedPage from "./pages/FeedPage";
import UserProfilePage from "./pages/UserProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/browse/projects" element={<PublicProjectsPage />} />
            <Route path="/browse/organizations" element={<PublicOrganizationsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/index" element={<Index />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/new" element={<CreateProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/organizations/new" element={<CreateOrganizationPage />} />
              <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
              <Route path="/organizations/:id/edit" element={<EditOrganizationPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/users/:userId" element={<UserProfilePage />} />
              <Route path="/profile/:userId" element={<UserProfilePage />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
