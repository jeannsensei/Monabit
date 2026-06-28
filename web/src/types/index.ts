export interface UserProfile {
  id: string;
  email?: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthResponse {
  user: UserProfile;
  session: AuthSession;
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

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
}

export interface CryptoResponse<T> {
  data: T;
  cached: boolean;
  cached_at?: string;
  last_api_fetch?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface FavoriteCoin {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  is_triggered: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: Record<string, { status: string; latency_ms?: number }>;
  version: string;
}
