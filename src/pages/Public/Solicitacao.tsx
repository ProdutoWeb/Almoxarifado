import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Plus, Minus, Check, Clock, XCircle, Search, Eraser } from 'lucide-react';

type Produto = Database['public']['Tables']['produtos']['Row'];
type ItemCarrinho = { produto: Produto; quantidade: number };

export const Solicitacao = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    siape: '',
    departamento: ''
  });

  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState({ codigo: '', descricao: '' });

  const handleBuscar = () => {
    setBuscaAplicada({ codigo: filtroCodigo, descricao: filtroDescricao });
  };

  const handleLimpar = () => {
    setFiltroCodigo('');
    setFiltroDescricao('');
    setBuscaAplicada({ codigo: '', descricao: '' });
  };

  const produtosFiltrados = produtos.filter(p => {
    const matchCodigo = buscaAplicada.codigo ? p.id.toLowerCase().includes(buscaAplicada.codigo.toLowerCase()) : true;
    const desc = buscaAplicada.descricao.toLowerCase();
    const matchDesc = buscaAplicada.descricao 
      ? p.nome.toLowerCase().includes(desc) || (p.descricao && p.descricao.toLowerCase().includes(desc))
      : true;
    return matchCodigo && matchDesc;
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

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
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }
    if (!form.nome || !form.siape || !form.departamento) {
      alert('Preencha os campos de Solicitante e Pagadora no final do formulário.');
      return;
    }

    setSubmitting(true);
    try {
      // O Supabase tem RLS (Row Level Security) que impede o usuário anônimo de ler dados (SELECT) da tabela pedidos.
      // Portanto, não podemos fazer .insert().select().single() como usuário anônimo.
      // A solução é gerar o UUID no cliente e enviar na inserção, para já termos o ID para a tabela filha.
      const novoPedidoId = crypto.randomUUID();

      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          id: novoPedidoId,
          solicitante_nome: form.nome,
          solicitante_siape: form.siape,
          departamento: form.departamento,
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

      setSucesso(true);
      setCarrinho([]);
      setForm({ nome: '', siape: '', departamento: '' });
      
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error);
      alert(`Ocorreu um erro ao enviar o pedido: ${error?.message || 'Erro desconhecido'}. Tente novamente.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded border border-gray-300 shadow-sm w-full max-w-md text-center">
          <Check className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h2>
          <p className="text-gray-600 mb-8">Sua requisição foi encaminhada ao almoxarifado.</p>
          <button
            onClick={() => setSucesso(false)}
            className="w-full bg-[#20558a] text-white font-medium py-2 rounded hover:bg-[#1a4570] transition"
          >
            Nova Solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-700 pb-10">
      
      {/* Container Principal que simula o Header Oculto e Foco no Conteúdo */}
      <div className="max-w-[1400px] mx-auto pt-8 px-4">
        <h1 className="text-2xl text-gray-800 font-normal mb-6">
          Adicionar materiais à solicitação
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
                        <td className="p-3 text-center text-gray-600 font-mono text-xs">{produto.id.substring(0, 8)}</td>
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
                            className="text-[#20558a] hover:text-[#113253] border border-transparent hover:border-[#20558a] bg-transparent hover:bg-blue-50 p-1 rounded-sm transition-colors cursor-pointer inline-flex"
                            title="Adicionar item"
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
                              onClick={() => {
                                // Remove totalmente do carrinho
                                setCarrinho(prev => prev.filter(c => c.produto.id !== item.produto.id));
                              }}
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

              {/* Informações da Requisição / Solicitante */}
              <div className="p-4 bg-gray-50 text-xs text-gray-700 space-y-4 border-b border-gray-200">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-900">Requisitado: Almoxarifado Central (Fixo)</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Solicitante (Nome):</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 p-1.5 focus:border-blue-400 outline-none rounded-sm bg-white"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">Solicitante (SIAPE):</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 p-1.5 focus:border-blue-400 outline-none rounded-sm bg-white"
                    value={form.siape}
                    onChange={(e) => setForm({ ...form, siape: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">Pagadora (Departamento/Setor):</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 p-1.5 focus:border-blue-400 outline-none rounded-sm bg-white"
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                  />
                </div>
              </div>

              {/* Botões de Ação Inferiores */}
              <div className="p-4 bg-white space-y-2">
                <button
                  type="submit"
                  disabled={submitting || carrinho.length === 0}
                  className="w-full bg-gradient-to-b from-[#2a68a6] to-[#1c4b7b] hover:from-[#1c4b7b] hover:to-[#15385c] text-white border border-[#143555] rounded-sm py-2 flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
                
                <button
                  type="button"
                  onClick={() => alert('Função guardada em rascunho local (Simulação)')}
                  className="w-full bg-gradient-to-b from-[#2a68a6] to-[#1c4b7b] hover:from-[#1c4b7b] hover:to-[#15385c] text-white border border-[#143555] rounded-sm py-2 flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Continuar Depois
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCarrinho([]);
                    setForm({ nome: '', siape: '', departamento: '' });
                  }}
                  className="w-full bg-gradient-to-b from-[#2a68a6] to-[#1c4b7b] hover:from-[#1c4b7b] hover:to-[#15385c] text-white border border-[#143555] rounded-sm py-2 flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
};
