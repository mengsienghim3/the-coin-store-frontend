"use server";

import { apiGet } from "./core/http.request.core";
import type { Banner } from "./models/banner.model";
import type { Game } from "./models/game.model";
import type { GiftCard } from "./models/gift-card.model";

export async function fetchBanners(all: boolean = false): Promise<Banner[]> {
  const response = await apiGet<Banner[]>(`/banners${all ? "?all=true" : ""}`);
  return response.data || [];
}

export async function fetchGames(all: boolean = false): Promise<Game[]> {
  const response = await apiGet<Game[]>(`/games${all ? "?all=true" : ""}`);
  return response.data || [];
}

export async function fetchGiftCards(all?: boolean): Promise<GiftCard[]> {
  const response = await apiGet<GiftCard[]>(
    `/gift-cards${all ? "?all=true" : ""}`,
  );
  return response.data || [];
}
