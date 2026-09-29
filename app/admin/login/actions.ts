"use server";

import { apiGet, apiPost, setAuthCookies } from "../../core/http.request.core";
import type { AdminUser, AuthResponse } from "../../models/auth.model";

export async function adminLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/login", {
    email,
    password,
  });

  if (!response.success) {
    throw new Error(response.error || "Authentication failed");
  }

  await setAuthCookies(response.data);
  return response.data;
}

export async function verifyAdminSession(
  token?: string,
): Promise<AdminUser | null> {
  const response = await apiGet<AdminUser>("/auth/me", {
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });

  return response.success ? response.data : null;
}
