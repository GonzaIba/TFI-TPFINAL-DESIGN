  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export enum ProvidersEnum {
    Google = "Google",
    GitHub = "GitHub",
    LinkedIn = "LinkedIn",
  }
  
  export interface RefreshTokenRequest {
    bearerToken: string;
    refreshToken: string;
  }
  
  export interface RegisterRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
  }