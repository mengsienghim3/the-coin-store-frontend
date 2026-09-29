export interface Banner {
  id: string;
  title: string;
  titleKh?: string | null;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateBannerPayload = {
  title: string;
  titleKh?: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
};

export type UpdateBannerPayload = Partial<
  Pick<Banner, "title" | "titleKh" | "imageUrl" | "linkUrl" | "order" | "isActive">
>;
