
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', session.user.id)
          .single();

        // If user was created less than 5 minutes ago, show onboarding
        if (profile) {
          const createdAt = new Date(profile.created_at);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          
          if (createdAt > fiveMinutesAgo) {
            setShowOnboarding(true);
          }
        }
      }
    };

    checkOnboardingStatus();
  }, []);

  return {
    showOnboarding,
    setShowOnboarding
  };
}
