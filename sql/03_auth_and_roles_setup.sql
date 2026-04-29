-- 1. Criação da Tabela de Perfis
CREATE TABLE public.perfis (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user' NOT NULL,
  siape TEXT NOT NULL,
  setor TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. Trigger para criar perfil automaticamente no SignUp (pegando metadados do frontend)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, role, siape, setor)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'siape', 'N/A'),
    COALESCE(NEW.raw_user_meta_data->>'setor', 'N/A')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Adicionar relacionamento do usuario criador no Pedido
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Reativar o Row Level Security (RLS)
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- 5. Limpar quaisquer políticas antigas conflitantes
DROP POLICY IF EXISTS "Produtos são visíveis para todos" ON public.produtos;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem inserir produtos" ON public.produtos;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar produtos" ON public.produtos;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem deletar produtos" ON public.produtos;

DROP POLICY IF EXISTS "Qualquer um pode criar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem ver pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar pedidos" ON public.pedidos;

DROP POLICY IF EXISTS "Qualquer um pode criar itens de pedido" ON public.itens_pedido;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem ver itens de pedido" ON public.itens_pedido;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar itens de pedido" ON public.itens_pedido;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem deletar itens de pedido" ON public.itens_pedido;

-- 6. Políticas do Perfil (perfis)
CREATE POLICY "Usuário pode ver o próprio perfil" ON public.perfis FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin pode ler todos os perfis" ON public.perfis FOR SELECT TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Admin pode modificar perfis" ON public.perfis FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );

-- 7. Políticas de Produtos
CREATE POLICY "Usuários logados podem ler produtos" ON public.produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin pode inserir produtos" ON public.produtos FOR INSERT TO authenticated WITH CHECK ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Admin pode atualizar produtos" ON public.produtos FOR UPDATE TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Admin pode deletar produtos" ON public.produtos FOR DELETE TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );

-- 8. Políticas de Pedidos
CREATE POLICY "Usuários podem inserir pedidos" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Visibilidade do pedido baseada no Setor ou se for admin" ON public.pedidos FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE perfis.id = auth.uid() 
    AND (
      perfis.role = 'admin' 
      OR perfis.setor = pedidos.departamento
    )
  )
);

CREATE POLICY "Admin pode atualizar pedidos" ON public.pedidos FOR UPDATE TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Admin pode deletar pedidos" ON public.pedidos FOR DELETE TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );


-- 9. Políticas de Itens do Pedido
CREATE POLICY "Usuários podem inserir itens do pedido do seu setor" ON public.itens_pedido FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pedidos p
    JOIN public.perfis u ON u.id = auth.uid()
    WHERE p.id = pedido_id AND (u.setor = p.departamento OR u.role = 'admin')
  )
);

CREATE POLICY "Visibilidade dos itens igual a do pedido" ON public.itens_pedido FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.pedidos p
    JOIN public.perfis u ON u.id = auth.uid()
    WHERE p.id = pedido_id AND (u.setor = p.departamento OR u.role = 'admin')
  )
);

CREATE POLICY "Admin pode atualizar itens_pedido" ON public.itens_pedido FOR UPDATE TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );
CREATE POLICY "Admin pode deletar itens_pedido" ON public.itens_pedido FOR DELETE TO authenticated USING ( EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') );
