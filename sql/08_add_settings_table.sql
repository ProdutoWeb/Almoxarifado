-- 1. Criar a tabela de configurações
CREATE TABLE IF NOT EXISTS public.configuracoes (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Inserir a configuração padrão de estoque
INSERT INTO public.configuracoes (key, value)
VALUES ('controle_estoque', '{"enabled": true}')
ON CONFLICT (key) DO NOTHING;

-- 3. Habilitar RLS
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
CREATE POLICY "Configuracoes legíveis por todos" ON public.configuracoes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admins alteram configuracoes" ON public.configuracoes
FOR ALL TO authenticated
USING (public.is_admin());
