const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8788";

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCoins(): Promise<Coin[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/coins`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch coins: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("Backend API unavailable, using fallback preview coins:", err);
    // Fallback data for preview when backend is not running
    return [
      {
        id: "coin-1",
        name: "Gold American Eagle",
        symbol: "AGE-1OZ",
        description:
          "1 oz 22-karat gold coin minted by the United States Mint.",
        price: 2450.0,
        stock: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
        category: "gold",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "coin-2",
        name: "Silver Britannia",
        symbol: "BRIT-1OZ",
        description:
          "1 oz .999 fine silver bullion coin struck by the Royal Mint.",
        price: 34.5,
        stock: 100,
        imageUrl:
          "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
        category: "silver",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "coin-3",
        name: "Canadian Gold Maple Leaf",
        symbol: "CML-1OZ",
        description:
          "1 oz .9999 pure gold bullion coin produced by the Royal Canadian Mint.",
        price: 2480.0,
        stock: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
        category: "gold",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "coin-4",
        name: "Morgan Silver Dollar 1921",
        symbol: "MRG-1921",
        description:
          "Historic 90% silver dollar minted in 1921 in uncirculated condition.",
        price: 65.0,
        stock: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=800&q=80",
        category: "collectible",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
