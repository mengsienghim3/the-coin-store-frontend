"use client";

import type { AuthResponse } from "../models/auth.model";

const AUTH_KEY = "the_coin_store_admin_auth";

export function getStoredAdmin(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAdmin(auth: AuthResponse): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearStoredAdmin(): void {
  localStorage.removeItem(AUTH_KEY);
}
