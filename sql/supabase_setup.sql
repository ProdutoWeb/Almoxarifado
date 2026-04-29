-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ENUM types
create type status_pedido as enum ('pendente', 'processado');
create type status_item_pedido as enum ('pendente', 'atendido', 'rejeitado');

-- Create Produtos table
create table public.produtos (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  unidade text not null,
  quantidade_estoque integer not null default 0,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Pedidos table
create table public.pedidos (
  id uuid default uuid_generate_v4() primary key,
  solicitante_nome text not null,
  solicitante_siape text not null,
  departamento text not null,
  status_geral status_pedido default 'pendente'::status_pedido not null,
  enviado boolean default false not null,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Itens Pedido table
create table public.itens_pedido (
  id uuid default uuid_generate_v4() primary key,
  pedido_id uuid references public.pedidos(id) on delete cascade not null,
  produto_id uuid references public.produtos(id) on delete restrict not null,
  quantidade_solicitada integer not null check (quantidade_solicitada > 0),
  quantidade_atendida integer default 0 not null check (quantidade_atendida >= 0),
  status status_item_pedido default 'pendente'::status_item_pedido not null
);

-- Row Level Security (RLS) Setup
-- Enable RLS on all tables
alter table public.produtos enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;

-- Create Policies

-- Produtos: Anyone can read (for the public catalog), but only authenticated users (admins) can modify
create policy "Produtos são visíveis para todos" 
  on public.produtos for select 
  using (true);

create policy "Apenas usuários autenticados podem inserir produtos" 
  on public.produtos for insert 
  to authenticated 
  with check (true);

create policy "Apenas usuários autenticados podem atualizar produtos" 
  on public.produtos for update 
  to authenticated 
  using (true);

create policy "Apenas usuários autenticados podem deletar produtos" 
  on public.produtos for delete 
  to authenticated 
  using (true);

-- Pedidos: Anyone can insert (public order form), but only authenticated users can read all or update
create policy "Qualquer um pode criar pedidos" 
  on public.pedidos for insert 
  to anon, authenticated
  with check (true);

create policy "Apenas usuários autenticados podem ver pedidos" 
  on public.pedidos for select 
  to authenticated 
  using (true);

create policy "Apenas usuários autenticados podem atualizar pedidos" 
  on public.pedidos for update 
  to authenticated 
  using (true);

-- Itens Pedido: Anyone can insert (part of public order form), but only authenticated users can read all or update
create policy "Qualquer um pode criar itens de pedido" 
  on public.itens_pedido for insert 
  to anon, authenticated
  with check (true);

create policy "Apenas usuários autenticados podem ver itens de pedido" 
  on public.itens_pedido for select 
  to authenticated 
  using (true);

create policy "Apenas usuários autenticados podem atualizar itens de pedido" 
  on public.itens_pedido for update 
  to authenticated 
  using (true);

create policy "Apenas usuários autenticados podem deletar itens de pedido"
  on public.itens_pedido for delete
  to authenticated
  using (true);
