-- FIX: Infinite recursion em políticas que consultam a própria tabela 'perfis'.
-- Solução: Criar uma função SECURITY DEFINER que ignora o RLS ao verificar o papel do usuário.

-- 1. Função auxiliar que verifica se o usuário logado é admin (bypassa RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Função auxiliar que retorna o setor do usuário logado (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_my_setor()
RETURNS TEXT AS $$
  SELECT setor FROM public.perfis WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Dropar TODAS as políticas antigas que causam recursão
DROP POLICY IF EXISTS "perfil_select_own" ON public.perfis;
DROP POLICY IF EXISTS "perfil_select_admin" ON public.perfis;
DROP POLICY IF EXISTS "perfil_all_admin" ON public.perfis;

DROP POLICY IF EXISTS "produtos_select" ON public.produtos;
DROP POLICY IF EXISTS "produtos_insert_admin" ON public.produtos;
DROP POLICY IF EXISTS "produtos_update_admin" ON public.produtos;
DROP POLICY IF EXISTS "produtos_delete_admin" ON public.produtos;

DROP POLICY IF EXISTS "pedidos_insert" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_select" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_delete_admin" ON public.pedidos;

DROP POLICY IF EXISTS "itens_insert" ON public.itens_pedido;
DROP POLICY IF EXISTS "itens_select" ON public.itens_pedido;
DROP POLICY IF EXISTS "itens_update_admin" ON public.itens_pedido;
DROP POLICY IF EXISTS "itens_delete_admin" ON public.itens_pedido;

-- ========== RECRIAR POLÍTICAS USANDO AS FUNÇÕES AUXILIARES ==========

-- 4. Políticas do Perfil (sem recursão)
CREATE POLICY "perfil_select_own" ON public.perfis FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "perfil_admin_all" ON public.perfis FOR ALL TO authenticated
  USING (public.is_admin());

-- 5. Políticas de Produtos
CREATE POLICY "produtos_select" ON public.produtos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "produtos_insert_admin" ON public.produtos FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "produtos_update_admin" ON public.produtos FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "produtos_delete_admin" ON public.produtos FOR DELETE TO authenticated
  USING (public.is_admin());

-- 6. Políticas de Pedidos
CREATE POLICY "pedidos_insert" ON public.pedidos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pedidos_select" ON public.pedidos FOR SELECT TO authenticated
  USING (public.is_admin() OR public.get_my_setor() = departamento);

CREATE POLICY "pedidos_update_admin" ON public.pedidos FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "pedidos_delete_admin" ON public.pedidos FOR DELETE TO authenticated
  USING (public.is_admin());

-- 7. Políticas de Itens do Pedido
CREATE POLICY "itens_insert" ON public.itens_pedido FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedido_id
      AND (public.is_admin() OR public.get_my_setor() = p.departamento)
    )
  );

CREATE POLICY "itens_select" ON public.itens_pedido FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedido_id
      AND (public.is_admin() OR public.get_my_setor() = p.departamento)
    )
  );

CREATE POLICY "itens_update_admin" ON public.itens_pedido FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "itens_delete_admin" ON public.itens_pedido FOR DELETE TO authenticated
  USING (public.is_admin());
