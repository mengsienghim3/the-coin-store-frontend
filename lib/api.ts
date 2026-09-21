const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8788';

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
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

// Fallback preview banners if backend is not yet seeded/connected
const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'bnr_001',
    title: 'Mobile Legends: Weekly Diamond Pass 20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/games/mobile-legends',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bnr_002',
    title: 'Free Fire: 1000+ Diamonds Instant Auto-Reload',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/games/free-fire',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bnr_003',
    title: 'PUBG Mobile: UC Cash Back & Royale Pass Special',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/games/pubg-mobile',
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback preview games
const FALLBACK_GAMES: Game[] = [
  {
    id: 'gam_mlbb',
    name: 'Mobile Legends',
    slug: 'mobile-legends',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    publisher: 'Moonton',
    category: 'MOBA',
    hasZoneId: true,
    inputGuide: 'Enter User ID & Zone ID (e.g. 12345678 (1234))',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gam_ff',
    name: 'Free Fire',
    slug: 'free-fire',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    publisher: 'Garena',
    category: 'Battle Royale',
    hasZoneId: false,
    inputGuide: 'Enter Player ID (UID)',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gam_pubg',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    publisher: 'Level Infinite',
    category: 'Battle Royale',
    hasZoneId: false,
    inputGuide: 'Enter Player ID',
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gam_hok',
    name: 'Honor of Kings',
    slug: 'honor-of-kings',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    publisher: 'Tencent Games',
    category: 'MOBA',
    hasZoneId: false,
    inputGuide: 'Enter Player UID',
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gam_genshin',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    publisher: 'HoYoverse',
    category: 'RPG',
    hasZoneId: true,
    inputGuide: 'Enter UID & Select Server',
    isActive: true,
    order: 5,
    createdAt: new Date().toISOString(),
  },
];

// --- Banners API ---
export async function fetchBanners(all: boolean = false): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/banners${all ? '?all=true' : ''}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Backend API unavailable, using fallback banners:', err);
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to create banner');
  return json.data;
}

export async function updateBanner(
  id: string,
  data: Partial<Pick<Banner, 'title' | 'imageUrl' | 'linkUrl' | 'order' | 'isActive'>>
): Promise<Banner> {
  const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to update banner');
  return json.data;
}

export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to delete banner');
}

// --- Games API ---
export async function fetchGames(): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/games`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Backend API unavailable, using fallback games:', err);
    return FALLBACK_GAMES;
  }
}

// --- Auth API ---
export async function adminLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Authentication failed');
  }
  return json.data;
}

// Session Helpers
const AUTH_KEY = 'the_coin_store_admin_auth';

export function getStoredAdmin(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAdmin(auth: AuthResponse): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearStoredAdmin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}
