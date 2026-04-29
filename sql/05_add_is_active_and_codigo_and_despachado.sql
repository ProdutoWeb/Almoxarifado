-- Adicionar colunas 'is_active', 'codigo' e 'observacao' à tabela 'produtos'
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Adicionar coluna 'despachado_em' à tabela 'pedidos'
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS despachado_em TIMESTAMP WITH TIME ZONE;
