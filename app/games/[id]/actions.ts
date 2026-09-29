"use server";

import { apiGet, apiPost } from "../../core/http.request.core";
import type { Game, PlayerValidationResult } from "../../models/game.model";
import type {
  GamePackage,
  GamePackagesResponse,
} from "../../models/package.model";
import type {
  CreatePaymentPayload,
  PaymentOrderResponse,
  PaymentStatusResponse,
} from "../../models/payment.model";

export async function fetchGame(id: string): Promise<Game | null> {
  const response = await apiGet<Game>(`/games/${id}`);
  return response.success ? response.data : null;
}

export async function fetchGamePackages(
  idOrSlug: string,
  fresh?: boolean,
): Promise<GamePackagesResponse> {
  const response = await apiGet<GamePackagesResponse>(
    `/games/${idOrSlug}/packages${fresh ? "?fresh=true" : ""}`,
  );
  if (!response.success)
    throw new Error(response.error || "Failed to fetch packages");
  return response.data;
}

export async function validatePlayer(
  idOrSlug: string,
  fields: Record<string, string>,
  providerCategoryId?: string | null,
): Promise<PlayerValidationResult> {
  const response = await apiPost<PlayerValidationResult>(
    `/games/${idOrSlug}/validate-player`,
    {
      fields,
      ...(providerCategoryId ? { providerCategoryId } : {}),
    },
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to validate player account");
  }
  return response.data;
}

export async function createPaymentOrder(
  payload: CreatePaymentPayload,
): Promise<PaymentOrderResponse> {
  const response = await apiPost<PaymentOrderResponse>(
    "/payments/create",
    payload,
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to initialize payment order");
  }
  console.log("Payment order created:", response.data);
  return response.data;
}

export async function checkPaymentStatus(
  tranId: string,
): Promise<PaymentStatusResponse> {
  const response = await apiGet<PaymentStatusResponse>(
    `/payments/status/${tranId}`,
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to check payment status");
  }
  return response.data;
}

export async function simulateSandboxPayment(
  tranId: string,
): Promise<PaymentStatusResponse> {
  const response = await apiPost<PaymentStatusResponse>(
    "/payments/simulate-sandbox",
    { tranId },
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to simulate sandbox approval");
  }
  return response.data;
}

export async function fetchPackage(id: string): Promise<GamePackage | null> {
  const response = await apiGet<GamePackage>(`/packages/${id}`);
  return response.success ? response.data : null;
}
