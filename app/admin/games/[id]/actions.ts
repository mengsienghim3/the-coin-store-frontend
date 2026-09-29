"use server";

import {
  fetchGame,
  fetchGamePackages,
  fetchPackage,
} from "../../../games/[id]/actions";
import { updateGame, uploadImage } from "../../actions";

import { apiDelete, apiPatch, apiPost } from "../../../core/http.request.core";
import type { Game } from "../../../models/game.model";
import type { GamePackage } from "../../../models/package.model";
import type { GamePackagesResponse } from "../../../models/package.model";
import type { UploadImageResponse } from "../../../models/upload.model";

export async function fetchAdminGame(id: string): Promise<Game | null> {
  return fetchGame(id);
}

export async function fetchAdminGamePackages(
  idOrSlug: string,
  fresh?: boolean,
): Promise<GamePackagesResponse> {
  return fetchGamePackages(idOrSlug, fresh);
}

export async function fetchAdminPackage(
  id: string,
): Promise<GamePackage | null> {
  return fetchPackage(id);
}

export async function updateAdminGame(
  id: string,
  data: Partial<Game>,
): Promise<Game> {
  return updateGame(id, data);
}

export async function uploadAdminGameImage(
  file: File,
): Promise<UploadImageResponse> {
  return uploadImage(file);
}

export async function syncGamePackages(idOrSlug: string): Promise<{
  synced: number;
  created: number;
  updated: number;
  total: number;
  packages: GamePackage[];
}> {
  const response = await apiPost<{
    synced: number;
    created: number;
    updated: number;
    total: number;
    packages: GamePackage[];
  }>(`/games/${idOrSlug}/packages/sync`, {});
  if (!response.success) {
    throw new Error(response.error || "Failed to sync packages with provider");
  }
  return response.data;
}

export async function createGamePackage(
  idOrSlug: string,
  data: Partial<GamePackage>,
): Promise<GamePackage> {
  const response = await apiPost<GamePackage>(`/games/${idOrSlug}/packages`, data);
  if (!response.success) throw new Error(response.error || "Failed to create package");
  return response.data;
}

export async function updateGamePackage(
  id: string,
  data: Partial<GamePackage>,
): Promise<GamePackage> {
  const response = await apiPatch<GamePackage>(`/packages/${id}`, data);
  if (!response.success) throw new Error(response.error || "Failed to update package");
  return response.data;
}

export async function deleteGamePackage(id: string): Promise<void> {
  const response = await apiDelete<void>(`/packages/${id}`);
  if (!response.success) throw new Error(response.error || "Failed to delete package");
}
