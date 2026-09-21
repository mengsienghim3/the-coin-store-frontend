const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  bannerUrl: string | null;
  publisher: string;
  category: string;
  hasZoneId: boolean;
  inputGuide: string | null;
  isActive: boolean;
  order: number;
  startingPrice?: string;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  brand: string;
  category: string;
  region: string;
  startingPrice: string;
  denominations: { label: string; price: string }[];
  isActive: boolean;
  order: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export interface ProviderProfile {
  userId: string;
  name: string;
  email: string;
  balanceUsd: number;
  tier: {
    name: string;
    discountLabel: string;
  };
  apiKey: {
    name: string;
    keyPrefix: string;
    rateLimitPerMin: number;
  };
}

// Fallback preview banners
const FALLBACK_BANNERS: Banner[] = [
  {
    id: "bnr_001",
    title: "Mobile Legends: Weekly Diamond Pass 20% OFF",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
    linkUrl: "/games/mobile-legends",
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bnr_002",
    title: "Free Fire: 1000+ Diamonds Instant Auto-Reload",
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
    linkUrl: "/games/free-fire",
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bnr_003",
    title: "PUBG Mobile: UC Cash Back & Royale Pass Special",
    imageUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&q=80",
    linkUrl: "/games/pubg-mobile",
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback preview games
const FALLBACK_GAMES: Game[] = [
  {
    id: "gam_mlbb",
    name: "Mobile Legends",
    slug: "mobile-legends",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    publisher: "Moonton",
    category: "MOBA",
    hasZoneId: true,
    inputGuide: "Enter User ID & Zone ID (e.g. 12345678 (1234))",
    startingPrice: "$1.45",
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "gam_ff",
    name: "Free Fire",
    slug: "free-fire",
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    publisher: "Garena",
    category: "Battle Royale",
    hasZoneId: false,
    inputGuide: "Enter Player ID (UID)",
    startingPrice: "$0.99",
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "gam_pubg",
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    imageUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
    publisher: "Level Infinite",
    category: "Battle Royale",
    hasZoneId: false,
    inputGuide: "Enter Player ID",
    startingPrice: "$1.10",
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "gam_hok",
    name: "Honor of Kings",
    slug: "honor-of-kings",
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    publisher: "Tencent Games",
    category: "MOBA",
    hasZoneId: false,
    inputGuide: "Enter Player UID",
    startingPrice: "$1.25",
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "gam_genshin",
    name: "Genshin Impact",
    slug: "genshin-impact",
    imageUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80",
    publisher: "HoYoverse",
    category: "RPG",
    hasZoneId: true,
    inputGuide: "Enter UID & Select Server",
    startingPrice: "$4.99",
    isActive: true,
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "gam_valorant",
    name: "Valorant Points",
    slug: "valorant",
    imageUrl:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=80",
    publisher: "Riot Games",
    category: "Shooter",
    hasZoneId: false,
    inputGuide: "Enter Riot ID (Username#TAG)",
    startingPrice: "$4.50",
    isActive: true,
    order: 6,
    createdAt: new Date().toISOString(),
  },
];

// Digital Gift Cards Catalog
const FALLBACK_GIFT_CARDS: GiftCard[] = [
  {
    id: "gift_steam",
    name: "Steam Wallet Code",
    slug: "steam-wallet",
    imageUrl:
      "https://images.unsplash.com/photo-1612287233207-6f8d078b663b?auto=format&fit=crop&w=600&q=80",
    brand: "Valve / Steam",
    category: "PC & Steam",
    region: "Global / US",
    startingPrice: "$5.00",
    denominations: [
      { label: "$5 Wallet Code", price: "$5.00" },
      { label: "$10 Wallet Code", price: "$10.00" },
      { label: "$20 Wallet Code", price: "$20.00" },
      { label: "$50 Wallet Code", price: "$50.00" },
      { label: "$100 Wallet Code", price: "$100.00" },
    ],
    isActive: true,
    order: 1,
  },
  {
    id: "gift_google",
    name: "Google Play Gift Card",
    slug: "google-play",
    imageUrl:
      "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=600&q=80",
    brand: "Google",
    category: "Mobile & Apps",
    region: "US / Global",
    startingPrice: "$5.00",
    denominations: [
      { label: "$5 Gift Card", price: "$5.00" },
      { label: "$10 Gift Card", price: "$10.00" },
      { label: "$25 Gift Card", price: "$25.00" },
      { label: "$50 Gift Card", price: "$50.00" },
    ],
    isActive: true,
    order: 2,
  },
  {
    id: "gift_apple",
    name: "Apple Gift Card & iTunes",
    slug: "apple-gift-card",
    imageUrl:
      "https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=600&q=80",
    brand: "Apple Inc.",
    category: "Mobile & Apps",
    region: "US Store",
    startingPrice: "$10.00",
    denominations: [
      { label: "$10 App Store", price: "$10.00" },
      { label: "$25 App Store", price: "$25.00" },
      { label: "$50 App Store", price: "$50.00" },
      { label: "$100 App Store", price: "$100.00" },
    ],
    isActive: true,
    order: 3,
  },
  {
    id: "gift_razer",
    name: "Razer Gold PIN",
    slug: "razer-gold",
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    brand: "Razer Inc.",
    category: "PC & Steam",
    region: "Global",
    startingPrice: "$5.00",
    denominations: [
      { label: "$5 Razer PIN", price: "$5.00" },
      { label: "$10 Razer PIN", price: "$10.00" },
      { label: "$20 Razer PIN", price: "$20.00" },
      { label: "$50 Razer PIN", price: "$50.00" },
    ],
    isActive: true,
    order: 4,
  },
  {
    id: "gift_psn",
    name: "PlayStation Store Card",
    slug: "playstation-network",
    imageUrl:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80",
    brand: "Sony Interactive",
    category: "Console",
    region: "US / Global",
    startingPrice: "$10.00",
    denominations: [
      { label: "$10 PSN Card", price: "$10.00" },
      { label: "$25 PSN Card", price: "$25.00" },
      { label: "$50 PSN Card", price: "$50.00" },
      { label: "$100 PSN Card", price: "$100.00" },
    ],
    isActive: true,
    order: 5,
  },
  {
    id: "gift_nintendo",
    name: "Nintendo eShop Card",
    slug: "nintendo-eshop",
    imageUrl:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80",
    brand: "Nintendo",
    category: "Console",
    region: "US / Global",
    startingPrice: "$10.00",
    denominations: [
      { label: "$10 eShop Card", price: "$10.00" },
      { label: "$20 eShop Card", price: "$20.00" },
      { label: "$35 eShop Card", price: "$35.00" },
      { label: "$50 eShop Card", price: "$50.00" },
    ],
    isActive: true,
    order: 6,
  },
];

// --- Session & Auth Helpers ---
const AUTH_KEY = "the_coin_store_admin_auth";

export function getStoredAdmin(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAdmin(auth: AuthResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearStoredAdmin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const session = getStoredAdmin();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }
  return headers;
}

// --- Banners API ---
export async function fetchBanners(all: boolean = false): Promise<Banner[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/banners${all ? "?all=true" : ""}`,
      {
        cache: "no-store",
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("Backend API unavailable, using fallback banners:", err);
    return all ? FALLBACK_BANNERS : FALLBACK_BANNERS.filter((b) => b.isActive);
  }
}

export async function createBanner(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}): Promise<Banner> {
  const res = await fetch(`${API_BASE_URL}/api/banners`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error?.message || "Failed to create banner");
  return json.data;
}

export async function updateBanner(
  id: string,
  data: Partial<
    Pick<Banner, "title" | "imageUrl" | "linkUrl" | "order" | "isActive">
  >,
): Promise<Banner> {
  const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error?.message || "Failed to update banner");
  return json.data;
}

export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error?.message || "Failed to delete banner");
}

// --- Upload to Cloudflare R2 API ---
export async function uploadImage(file: File): Promise<{
  url: string;
  key: string;
  filename: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const session = getStoredAdmin();
  const headers: Record<string, string> = {};
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.error?.message || "Failed to upload image to Cloudflare R2",
    );
  }

  return json.data;
}

// --- Games API ---
export async function fetchGames(): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/games`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return FALLBACK_GAMES;
  }
}

// --- Gift Cards API ---
export async function fetchGiftCards(): Promise<GiftCard[]> {
  // Can connect to future gift card backend route
  return FALLBACK_GIFT_CARDS;
}

// --- Auth API ---
export async function adminLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Authentication failed");
  }
  return json.data;
}

export async function verifyAdminSession(
  token: string,
): Promise<AdminUser | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// --- Provider / Reseller API ---
export async function fetchProviderProfile(): Promise<ProviderProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/provider/profile`, {
      cache: "no-store",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Failed to fetch provider profile:", err);
    return null;
  }
}
