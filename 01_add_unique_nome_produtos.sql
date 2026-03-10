-- Add UNIQUE constraint to nome column in produtos table
-- This prevents duplicate product creation, especially during CSV imports.

ALTER TABLE public.produtos ADD CONSTRAINT produtos_nome_key UNIQUE (nome);
