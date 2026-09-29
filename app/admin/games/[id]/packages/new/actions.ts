"use server";

import {
  createGamePackage,
  fetchAdminGame,
  fetchAdminGamePackages,
} from "../../actions";
import type { Game } from "../../../../../models/game.model";
import type {
  GamePackage,
  GamePackagesResponse,
} from "../../../../../models/package.model";

export async function fetchNewPackageGame(id: string): Promise<Game | null> {
  return fetchAdminGame(id);
}

export async function fetchNewPackageGamePackages(
  idOrSlug: string,
): Promise<GamePackagesResponse> {
  return fetchAdminGamePackages(idOrSlug);
}

export async function createNewGamePackage(
  idOrSlug: string,
  data: Partial<GamePackage>,
): Promise<GamePackage> {
  return createGamePackage(idOrSlug, data);
}
