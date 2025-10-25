  export interface InitialApplicationState {
    remoteIp: string;
    userAgent: string;
    cookie: string;
  }

  export interface UserApplication {
    userName: string;
    email: string;
    roleName: string;
    isOnboarded: boolean;
    hasSeenIntroPublications?: boolean;
    hasSeenIntroLabels?: boolean;
    hasSeenIntroUsers?: boolean;
    hasSeenIntroLiveHelp?: boolean;
  }