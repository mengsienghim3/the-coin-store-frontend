export interface Game {
  id: string;
  providerId?: string | null;
  name: string;
  nameKh?: string | null;
  slug: string;
  imageUrl: string;
  bannerUrl?: string | null;
  providerCategoryId?: string | null;
  canValidate?: boolean;
  packageCount?: number;
  publisher?: string | null;
  category: string;
  hasZoneId: boolean;
  inputGuide?: string | null;
  startingPrice?: string | null;
  isActive: boolean;
  order: number;
  isCustomImage?: boolean;
  isCustomName?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PlayerValidationResult {
  valid: boolean;
  playerName?: string | null;
  playerId?: string | null;
  region?: string | null;
  message?: string;
}
