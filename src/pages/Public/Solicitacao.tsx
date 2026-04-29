import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Database } from '../../types/database.types';
import { Plus, Minus, Check, XCircle, Search, Eraser, Download, LogOut } from 'lucide-react';
import Papa from 'papaparse';

type Produto = Database['public']['Tables']['produtos']['Row'];
type ItemCarrinho = { produto: Produto; quantidade: number };

export const Solicitacao = () => {
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [ultimoPedido, setUltimoPedido] = useState<any>(null);

  const diaAtual = new Date().getDate();
  const periodoBloqueado = diaAtual < 15;

  // O form agora reflete os dados inalteráveis do perfil do usuário logado
  const [form, setForm] = useState({
    nome: '',
    siape: '',
    departamento: ''
  });

  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState({ codigo: '', descricao: '' });

  useEffect(() => {
    // Redireciona para login se não estiver autenticado
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Abastece os dados fixos
    if (profile && user) {
      setForm({
        nome: user.email || '',
        siape: profile.siape,
        departamento: profile.setor
      });
    }
  }, [profile, user]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarProdutos();
    }
  }, [isAuthenticated]);

  const handleBuscar = () => {
    setBuscaAplicada({ codigo: filtroCodigo, descricao: filtroDescricao });
  };

  const handleLimpar = () => {
    setFiltroCodigo('');
    setFiltroDescricao('');
    setBuscaAplicada({ codigo: '', descricao: '' });
  };

  const produtosFiltrados = produtos.filter(p => {
    if (p.is_active === false) return false;
    
    const matchCodigo = buscaAplicada.codigo ? p.codigo?.toLowerCase().includes(buscaAplicada.codigo.toLowerCase()) : true;
    const desc = buscaAplicada.descricao.toLowerCase();
    const matchDesc = buscaAplicada.descricao 
      ? p.nome.toLowerCase().includes(desc) || (p.descricao && p.descricao.toLowerCase().includes(desc))
      : true;
    return matchCodigo && matchDesc;
  });

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const existente = prev.find(item => item.produto.id === produto.id);
      if (existente) {
        return prev.map(item => 
          item.produto.id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho((prev) => {
      const existente = prev.find(item => item.produto.id === produtoId);
      if (existente && existente.quantidade > 1) {
        return prev.map(item =>
          item.produto.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        );
      }
      return prev.filter(item => item.produto.id !== produtoId);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carrinho.length === 0) {
      alert('Almoxarifado Fácil: Adicione pelo menos um item ao carrinho antes de enviar a solicitação.');
      return;
    }

    setSubmitting(true);
    try {
      const novoPedidoId = crypto.randomUUID();

      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          id: novoPedidoId,
          solicitante_nome: form.nome, // Preenchido via contexto (E-mail ou nome)
          solicitante_siape: form.siape, // Via Perfil
          departamento: form.departamento, // Via Perfil
          user_id: user?.id, // Vincula o id logado para o RLS
          status_geral: 'pendente',
          enviado: false
        });

      if (pedidoError) throw pedidoError;

      const itensParaInserir: Database['public']['Tables']['itens_pedido']['Insert'][] = carrinho.map((item) => ({
        pedido_id: novoPedidoId,
        produto_id: item.produto.id,
        quantidade_solicitada: item.quantidade,
        quantidade_atendida: 0,
        status: 'pendente'
      }));

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      setUltimoPedido({
        carrinho: [...carrinho],
        form: { ...form },
        id: novoPedidoId,
        data: new Date().toLocaleString()
      });
      setSucesso(true);
      setCarrinho([]);
      
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error);
      alert(`Almoxarifado Fácil: Ocorreu um erro ao enviar a sua solicitação de materiais: ${error?.message || 'Erro desconhecido'}.\n\nPor favor, tente novamente ou contacte o Almoxarifado.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  if (sucesso) {
    const baixarPlanilha = () => {
      if (!ultimoPedido) return;
      
      const dados = ultimoPedido.carrinho.map((item: any) => ({
        "Pedido ID": ultimoPedido.id,
        "Data": ultimoPedido.data,
        "Solicitante": ultimoPedido.form.nome,
        "SIAPE": ultimoPedido.form.siape,
        "Departamento": ultimoPedido.form.departamento,
        "Cód Produto": item.produto.codigo || item.produto.id.substring(0, 8),
        "Produto": item.produto.nome,
        "Unidade": item.produto.unidade,
        "Qtd Solicitada": item.quantidade
      }));

      const csv = Papa.unparse(dados, { delimiter: ';' });
      // Add BOM to fix Excel accent encoding
      const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pedido_${ultimoPedido.form.departamento}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded border border-gray-300 shadow-sm w-full max-w-md text-center">
          <Check className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h2>
          <p className="text-gray-600 mb-6">Sua requisição foi encaminhada ao almoxarifado.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={baixarPlanilha}
              className="w-full bg-green-600 text-white font-bold py-2.5 rounded hover:bg-green-700 transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Download className="h-5 w-5 mr-2" />
              Baixar Resumo (Excel)
            </button>
            <button
              onClick={() => { setSucesso(false); setUltimoPedido(null); }}
              className="w-full bg-[#20558a] text-white font-bold py-2.5 rounded hover:bg-[#1a4570] transition cursor-pointer shadow-sm"
            >
              Nova Solicitação
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-700 pb-10">
      
      {/* Header com Logout */}
      <div className="bg-slate-900 w-full px-6 py-4 flex justify-between items-center text-white shadow-md">
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">Portal de Solicitações de Materiais</span>
          <span className="text-sm text-slate-300">Setor Autenticado: {profile?.setor}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {profile?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')} 
              className="text-sm font-medium hover:text-blue-300 underline"
            >
              Acessar Painel Admin
            </button>
          )}
          <button 
            onClick={signOut} 
            className="flex items-center text-red-400 hover:text-red-300 hover:bg-slate-800 px-3 py-2 rounded transition-colors border border-transparent hover:border-red-400"
          >
            <LogOut className="w-4 h-4 mr-2"/> Sair
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto pt-8 px-4">
        {periodoBloqueado && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <h3 className="font-bold text-lg mb-1 text-red-800">Acesso Bloqueado Temporariamente</h3>
            <p className="text-red-700 font-medium">
              Período de pedidos ao almoxarifado: do dia 15 ao dia 30 de cada mês
            </p>
          </div>
        )}
        <h1 className="text-2xl text-gray-800 font-normal mb-6">
          Adicionar materiais à requisição
        </h1>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* ===================== ÁREA 1: FILTRO ===================== */}
          <div className="w-full lg:w-56 border border-gray-300 rounded-sm bg-gray-50 flex-shrink-0">
            <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 p-2 text-xs font-bold text-gray-700">
              Filtro
            </div>
            <div className="p-3 text-xs space-y-4">
              <div>
                <label className="block font-bold mb-1 text-gray-700">Código</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-1 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none rounded-sm bg-white"
                  value={filtroCodigo}
                  onChange={e => setFiltroCodigo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700">Descrição</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-1 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none rounded-sm bg-white"
                  value={filtroDescricao}
                  onChange={e => setFiltroDescricao(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleBuscar}
                  className="w-full bg-gradient-to-b from-[#2a68a6] to-[#1c4b7b] hover:from-[#1c4b7b] hover:to-[#15385c] text-white border border-[#143555] rounded-sm py-1.5 flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5 mr-2" />
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={handleLimpar}
                  className="w-full bg-gradient-to-b from-[#2a68a6] to-[#1c4b7b] hover:from-[#1c4b7b] hover:to-[#15385c] text-white border border-[#143555] rounded-sm py-1.5 flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Eraser className="h-3.5 w-3.5 mr-2" />
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* ===================== ÁREA 2: RESULTADO ===================== */}
          <div className="flex-1 w-full border border-gray-300 rounded-sm bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 p-2 text-xs font-bold text-gray-700">
              Resultado da Busca ({produtosFiltrados.length} Itens Encontrados)
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-xs text-left">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 font-bold text-gray-800 text-center">Cód. Produto</th>
                    <th className="p-3 font-bold text-gray-800">Item</th>
                    <th className="p-3 font-bold text-gray-800 text-center">Unidade</th>
                    <th className="p-3 font-bold text-gray-800 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Carregando catálogo...
                      </td>
                    </tr>
                  ) : produtosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-600 italic">
                        Use o filtro para encontrar os itens.
                      </td>
                    </tr>
                  ) : (
                    produtosFiltrados.map((produto) => (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="p-3 text-center text-gray-600 font-mono text-xs">{produto.codigo || '-'}</td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-800">{produto.nome}</span>
                          {produto.descricao && (
                            <span className="block text-gray-500 mt-0.5">{produto.descricao}</span>
                          )}
                        </td>
                        <td className="p-3 text-center text-gray-600">{produto.unidade}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => adicionarAoCarrinho(produto)}
                            disabled={periodoBloqueado}
                            className={`p-1 rounded-sm transition-colors inline-flex ${
                              periodoBloqueado 
                                ? 'text-gray-300 opacity-50 cursor-not-allowed' 
                                : 'text-[#20558a] hover:text-[#113253] border border-transparent hover:border-[#20558a] bg-transparent hover:bg-blue-50 cursor-pointer'
                            }`}
                            title={periodoBloqueado ? "Período bloqueado" : "Adicionar item"}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===================== ÁREA 3: CARRINHO ===================== */}
          <div className="w-full lg:w-[400px] border border-gray-300 rounded-sm bg-white shadow-sm overflow-hidden flex-shrink-0">
            <div className="bg-[#20558a] text-white p-2 text-xs font-bold border-b border-[#153b61]">
              Itens Adicionados
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Tabela de Itens Adicionados */}
              <div className="overflow-x-auto min-h-[150px] max-h-[300px] overflow-y-auto border-b border-gray-200">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="p-2 font-bold text-gray-800">Item</th>
                      <th className="p-2 font-bold text-gray-800 text-center">Quant.</th>
                      <th className="p-2 font-bold text-gray-800 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {carrinho.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-600 italic">
                          Nenhum item adicionado.
                        </td>
                      </tr>
                    ) : (
                      carrinho.map((item) => (
                        <tr key={item.produto.id} className="hover:bg-gray-50">
                          <td className="p-2 text-gray-700 font-medium truncate max-w-[150px]" title={item.produto.nome}>
                            {item.produto.nome}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => removerDoCarrinho(item.produto.id)}
                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center">{item.quantidade}</span>
                              <button
                                type="button"
                                onClick={() => adicionarAoCarrinho(item.produto)}
                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => setCarrinho(prev => prev.filter(c => c.produto.id !== item.produto.id))}
                              className="text-red-500 hover:text-red-700 cursor-pointer inline-flex"
                              title="Remover Item"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informações da Requisição / Solicitante (Travadas via Perfil) */}
              <div className="p-4 bg-gray-50 text-xs text-gray-700 space-y-4 border-b border-gray-200">
                <div className="flex flex-col gap-1 text-center border-b pb-2 mb-2">
                  <span className="font-bold text-gray-900 border border-yellow-300 bg-yellow-50 rounded p-1 text-[10px] uppercase">
                    Os dados do solicitante são preenchidos automaticamente.
                  </span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Solicitante (E-mail vinculado):</label>
                  <input
                    type="text"
                    disabled
                    className="w-full border border-gray-300 p-1.5 outline-none rounded-sm bg-gray-200 text-gray-500 cursor-not-allowed"
                    value={form.nome}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Solicitante (SIAPE):</label>
                  <input
                    type="text"
                    disabled
                    className="w-full border border-gray-300 p-1.5 outline-none rounded-sm bg-gray-200 text-gray-500 cursor-not-allowed"
                    value={form.siape}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500">Pagadora (Setor de Origem):</label>
                  <input
                    type="text"
                    disabled
                    className="w-full border border-gray-300 p-1.5 outline-none rounded-sm bg-gray-200 text-gray-500 cursor-not-allowed"
                    value={form.departamento}
                  />
                </div>
              </div>

              {/* Botões de Ação Inferiores */}
              <div className="p-4 bg-white space-y-2">
                <button
                  type="submit"
                  disabled={submitting || carrinho.length === 0 || periodoBloqueado}
                  className="w-full bg-gradient-to-b from-[#2a68a6] to-[#1c4b7b] hover:from-[#1c4b7b] hover:to-[#15385c] text-white border border-[#143555] rounded-sm py-2 flex items-center justify-center font-bold text-xs shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {submitting ? 'Enviando Autorização...' : 'Enviar Solicitação Oficial'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setCarrinho([]);
                  }}
                  className="w-full bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-300 rounded-sm py-2 flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Esvaziar Carrinho
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
