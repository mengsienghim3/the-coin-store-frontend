export interface GiftCard {
  id: string;
  providerId?: string | null;
  name: string;
  nameKh?: string | null;
  slug: string;
  providerCategoryId?: string | null;
  imageUrl: string;
  description?: string | null;
  descriptionKh?: string | null;
  category: string;
  brand?: string | null;
  deliveryType?: string | null;
  region?: string | null;
  startingPrice?: string | null;
  denominations?: { label: string; price: string }[];
  isActive: boolean;
  order: number;
  isCustomImage?: boolean;
  isCustomName?: boolean;
  isCustomDescription?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
