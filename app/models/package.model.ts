import type { Game } from "./game.model";

export interface CompositeRecipeItem {
  packageId: string;
  name: string;
  priceUsd: number;
  quantity: number;
}

export interface GamePackage {
  id: string;
  gameId: string;
  providerPackageId?: string | null;
  name: string;
  nameKh?: string | null;
  description?: string | null;
  diamonds?: number | null;
  bonusDiamonds?: number | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  priceUsd: string;
  originalPrice?: string | null;
  costPriceUsd?: string | null;
  iconUrl?: string | null;
  isComposite?: boolean;
  compositeRecipe?: string | CompositeRecipeItem[] | null;
  inStock?: boolean;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GamePackagesResponse {
  game: Game & { currencyName?: string; currencyIcon?: string };
  canValidate?: boolean;
  fields: Array<{ key: string; label: string; type: string }>;
  packages: GamePackage[];
  providerPackages?: Array<{
    id: string;
    name: string;
    priceUsd: number;
    retailPriceUsd?: number;
    inStock?: boolean;
  }>;
}
