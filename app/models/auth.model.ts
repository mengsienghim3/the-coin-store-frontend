export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export interface ProviderProfile {
  userId: string;
  name: string;
  email: string;
  balanceUsd: number;
  tier: {
    name: string;
    discountLabel: string;
  };
  apiKey: {
    name: string;
    keyPrefix: string;
    rateLimitPerMin: number;
  };
}
