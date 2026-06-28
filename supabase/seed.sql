-- Seed data for local development (IDs are placeholders — replace with real auth.users IDs)
INSERT INTO public.profiles (id, username, full_name, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'testuser', 'Test User', 'user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.favorites (user_id, coin_id, coin_symbol, coin_name)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'bitcoin', 'btc', 'Bitcoin'),
  ('00000000-0000-0000-0000-000000000002', 'ethereum', 'eth', 'Ethereum')
ON CONFLICT DO NOTHING;
