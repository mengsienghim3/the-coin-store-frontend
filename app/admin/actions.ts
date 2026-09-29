"use server";

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
  clearAuthCookies,
} from "../core/http.request.core";
import type { ProviderProfile } from "../models/auth.model";
import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "../models/banner.model";
import type { Game } from "../models/game.model";
import type { GiftCard } from "../models/gift-card.model";
import type { UploadImageResponse } from "../models/upload.model";

export async function adminLogout() {
  await clearAuthCookies();
}

export async function fetchProviderProfile(): Promise<ProviderProfile | null> {
  const response = await apiGet<ProviderProfile>("/provider/profile");
  return response.success ? response.data : null;
}

export async function createBanner(data: CreateBannerPayload): Promise<Banner> {
  const response = await apiPost<Banner>("/banners", data);
  if (!response.success) throw new Error(response.error || "Failed to create banner");
  return response.data;
}

export async function updateBanner(
  id: string,
  data: UpdateBannerPayload,
): Promise<Banner> {
  const response = await apiPatch<Banner>(`/banners/${id}`, data);
  if (!response.success) throw new Error(response.error || "Failed to update banner");
  return response.data;
}

export async function deleteBanner(id: string): Promise<void> {
  const response = await apiDelete<void>(`/banners/${id}`);
  if (!response.success) throw new Error(response.error || "Failed to delete banner");
}

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiUpload<UploadImageResponse>("/upload", formData);
  if (!response.success) {
    throw new Error(response.error || "Failed to upload image to Cloudflare R2");
  }
  return response.data;
}

export async function syncGamesWithProvider(): Promise<{
  synced: number;
  created: number;
  updated: number;
  total: number;
  items: Game[];
}> {
  const response = await apiPost<{
    synced: number;
    created: number;
    updated: number;
    total: number;
    items: Game[];
  }>("/games/sync", {});
  if (!response.success) {
    throw new Error(response.error || "Failed to sync games with provider");
  }
  return response.data;
}

export async function updateGame(id: string, data: Partial<Game>): Promise<Game> {
  const response = await apiPatch<Game>(`/games/${id}`, data);
  if (!response.success) throw new Error(response.error || "Failed to update game");
  return response.data;
}

export async function deleteGame(id: string): Promise<void> {
  const response = await apiDelete<void>(`/games/${id}`);
  if (!response.success) throw new Error(response.error || "Failed to delete game");
}

export async function syncGiftCardsWithProvider(): Promise<{
  synced: number;
  created: number;
  updated: number;
  total: number;
  items: GiftCard[];
}> {
  const response = await apiPost<{
    synced: number;
    created: number;
    updated: number;
    total: number;
    items: GiftCard[];
  }>("/gift-cards/sync", {});
  if (!response.success) {
    throw new Error(response.error || "Failed to sync gift cards with provider");
  }
  return response.data;
}

export async function updateGiftCard(
  id: string,
  data: Partial<GiftCard>,
): Promise<GiftCard> {
  const response = await apiPatch<GiftCard>(`/gift-cards/${id}`, data);
  if (!response.success) {
    throw new Error(response.error || "Failed to update gift card");
  }
  return response.data;
}

export async function deleteGiftCard(id: string): Promise<void> {
  const response = await apiDelete<void>(`/gift-cards/${id}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to delete gift card");
  }
}
