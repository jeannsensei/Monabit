export interface UserProfile {
  id: string;
  email?: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  sparkline_in_7d: { price: number[] };
  last_updated: string;
}

export interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  market_cap_change_percentage_24h: number;
  last_updated: string;
}

export interface PriceHistory {
  coin_id: string;
  days: number;
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface FavoriteCoin {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  created_at: string;
}

export interface AuditLogInput {
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}
