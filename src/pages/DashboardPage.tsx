import { Layout } from "@/components/layout";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function DashboardPage() {
  const { showOnboarding, setShowOnboarding } = useOnboarding();
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">Welcome to your dashboard!</p>
      </div>
      
      <OnboardingFlow 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </Layout>
  );
}
