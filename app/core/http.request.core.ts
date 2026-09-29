"use server";

import { cookies } from "next/headers";
import { ResponseModelCore } from "./http.response.model.core";

const apiOrigin = process.env.BASE_URL
  ? process.env.BASE_URL.replace(/\/+$/, "")
  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"}/api`;

const authTokenKey = "auth_token";
const roleTypeKey = "role_type";
const accessTokenMaxAgeSeconds = 60 * 60 * 24 * 7;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const secureCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});

function toResponseModel<T>(
  raw: { ok?: boolean; data?: T; error?: { message?: string }; message?: string },
  status: number,
): ResponseModelCore<T> {
  return {
    success: raw.ok ?? (status >= 200 && status < 300),
    status,
    error: raw.error?.message || raw.message || "",
    data: raw.data as T,
  };
}

export async function clearAuthCookies(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  store.set(authTokenKey, "", { path: "/", maxAge: 0 });
  store.set(roleTypeKey, "", { path: "/", maxAge: 0 });
}

export async function setAuthCookies(session: {
  token?: string;
  user?: { role?: string };
}) {
  const cookieStore = await cookies();
  cookieStore.set(
    authTokenKey,
    session.token ?? "",
    secureCookieOptions(accessTokenMaxAgeSeconds),
  );
  cookieStore.set(
    roleTypeKey,
    session.user?.role ?? "",
    secureCookieOptions(accessTokenMaxAgeSeconds),
  );
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  uri: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ResponseModelCore<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authTokenKey)?.value;

  const res = await fetch(`${apiOrigin}${uri}`, {
    method,
    ...options,
    cache: options?.cache ?? "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const raw = await res.json().catch(() => ({}));
  return toResponseModel<T>(raw, res.status);
}

export async function apiGet<T>(
  uri: string,
  options?: RequestInit & { cacheTag?: string },
): Promise<ResponseModelCore<T>> {
  const { cacheTag, ...fetchOptions } = options ?? {};
  return request<T>("GET", uri, undefined, {
    ...fetchOptions,
    ...(cacheTag
      ? { next: { ...(fetchOptions.next ?? {}), tags: [cacheTag] } }
      : {}),
  });
}

export async function apiPost<T>(
  uri: string,
  body: unknown,
  options?: RequestInit,
): Promise<ResponseModelCore<T>> {
  return request<T>("POST", uri, body, options);
}

export async function apiPut<T>(
  uri: string,
  body: unknown,
  options?: RequestInit,
): Promise<ResponseModelCore<T>> {
  return request<T>("PUT", uri, body, options);
}

export async function apiPatch<T>(
  uri: string,
  body: unknown,
  options?: RequestInit,
): Promise<ResponseModelCore<T>> {
  return request<T>("PATCH", uri, body, options);
}

export async function apiDelete<T>(
  uri: string,
  options?: RequestInit,
): Promise<ResponseModelCore<T>> {
  return request<T>("DELETE", uri, undefined, options);
}

export async function apiUpload<T>(
  uri: string,
  formData: FormData,
  options?: RequestInit,
): Promise<ResponseModelCore<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authTokenKey)?.value;

  const res = await fetch(`${apiOrigin}${uri}`, {
    method: "POST",
    ...options,
    cache: options?.cache ?? "no-store",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    body: formData,
  });

  const raw = await res.json().catch(() => ({}));
  return toResponseModel<T>(raw, res.status);
}
