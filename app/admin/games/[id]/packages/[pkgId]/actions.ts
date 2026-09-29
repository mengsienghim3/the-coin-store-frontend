"use server";

import {
  deleteGamePackage,
  fetchAdminGame,
  fetchAdminGamePackages,
  fetchAdminPackage,
  updateGamePackage,
} from "../../actions";
import type { Game } from "../../../../../models/game.model";
import type {
  GamePackage,
  GamePackagesResponse,
} from "../../../../../models/package.model";

export async function fetchEditPackageGame(id: string): Promise<Game | null> {
  return fetchAdminGame(id);
}

export async function fetchEditPackageGamePackages(
  idOrSlug: string,
): Promise<GamePackagesResponse> {
  return fetchAdminGamePackages(idOrSlug);
}

export async function fetchEditPackage(
  id: string,
): Promise<GamePackage | null> {
  return fetchAdminPackage(id);
}

export async function updateEditGamePackage(
  id: string,
  data: Partial<GamePackage>,
): Promise<GamePackage> {
  return updateGamePackage(id, data);
}

export async function deleteEditGamePackage(id: string): Promise<void> {
  return deleteGamePackage(id);
}
