export enum OnboardingUserEnum {
  Onboarding = 'Onboarding',
  HasSeenIntroPublications = 'HasSeenIntroPublications',
  HasSeenIntroLabels = 'HasSeenIntroLabels',
  HasSeenIntroUsers = 'HasSeenIntroUsers',
  HasSeenIntroLiveHelp = 'HasSeenIntroLiveHelp',
  HasSeenIntroLiveHelpConfirmed = 'HasSeenIntroLiveHelpConfirmed',
  HasSeenIntroLiveHelpDetailHelp = 'HasSeenIntroLiveHelpDetailHelp',
  HasSeenIntroLiveHelpDetailHelped = 'HasSeenIntroLiveHelpDetailHelped',
}

export type CompleteOnboardingPayload = {
  onboardingUser: OnboardingUserEnum;
};
