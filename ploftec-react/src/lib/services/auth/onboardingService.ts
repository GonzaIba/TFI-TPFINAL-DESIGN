import { apiBaseService } from '../apiBaseService';
import { CompleteOnboardingPayload, OnboardingUserEnum } from '@/lib/types/onboarding';

export const onboardingService = {
  async completeOnboarding(onboardingUser: OnboardingUserEnum) {
    const query = `onboardingUser=${encodeURIComponent(onboardingUser)}`;

    return apiBaseService.execute<void, CompleteOnboardingPayload>({
      method: 'POST',
      url: `User/CompleteOnboarding?${query}`,
      body: { onboardingUser },
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },
};
