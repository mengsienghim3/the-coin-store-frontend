"use server";

import { fetchGiftCard } from "../../../gift-cards/[id]/actions";
import { deleteGiftCard, updateGiftCard, uploadImage } from "../../actions";
import type { GiftCard } from "../../../models/gift-card.model";
import type { UploadImageResponse } from "../../../models/upload.model";

export async function fetchAdminGiftCard(
  idOrSlug: string,
): Promise<GiftCard | null> {
  return fetchGiftCard(idOrSlug);
}

export async function updateAdminGiftCard(
  id: string,
  data: Partial<GiftCard>,
): Promise<GiftCard> {
  return updateGiftCard(id, data);
}

export async function deleteAdminGiftCard(id: string): Promise<void> {
  return deleteGiftCard(id);
}

export async function uploadAdminGiftCardImage(
  file: File,
): Promise<UploadImageResponse> {
  return uploadImage(file);
}
