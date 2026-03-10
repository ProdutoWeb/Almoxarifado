-- Desabilitar a Política RLS nativa do Supabase
-- Permite que o Frontend em React cuide do sistema de listagem e aprovação através da senha fixa.

alter table public.produtos disable row level security;
alter table public.pedidos disable row level security;
alter table public.itens_pedido disable row level security;
