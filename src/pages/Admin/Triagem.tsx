import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

type PedidoComItens = Database['public']['Tables']['pedidos']['Row'] & {
  itens_pedido: (Database['public']['Tables']['itens_pedido']['Row'] & {
    produto: Database['public']['Tables']['produtos']['Row']
  })[]
};

export const Triagem = () => {
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'pedido' | 'produto'>('pedido');

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens_pedido (
            *,
            produto:produtos (*)
          )
        `)
        .eq('status_geral', 'pendente')
        .order('criado_em', { ascending: true });
      
      if (error) throw error;
      setPedidos((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resolverItem = async (itemId: string, pedidoId: string, status: 'atendido' | 'rejeitado', qtdAtendida: number) => {
    // Encontrar o produto e o estoque atual no estado local
    const pedido = pedidos.find(p => p.id === pedidoId);
    const item = pedido?.itens_pedido.find(i => i.id === itemId);
    const produtoId = item?.produto?.id;
    const estoqueAtual = item?.produto?.quantidade_estoque || 0;

    // Se o pedido foi atendido, abater a quantidade do estoque do produto
    if (status === 'atendido' && qtdAtendida > 0 && produtoId) {
      const novoEstoque = estoqueAtual - qtdAtendida;
      const { error: produtoError } = await supabase
        .from('produtos')
        .update({ quantidade_estoque: novoEstoque })
        .eq('id', produtoId);
        
      if (produtoError) {
        console.error('Erro ao abater estoque:', produtoError);
        alert('Erro ao atualizar estoque do produto.');
        return;
      }
    }

    // 1. Atualizar o item
    const { error: itemError } = await supabase
      .from('itens_pedido')
      .update({ status, quantidade_atendida: qtdAtendida })
      .eq('id', itemId);
      
    if (itemError) {
      console.error(itemError);
      alert('Erro ao atualizar item');
      return;
    }

    // Atualizar no estado local para checar se o pedido já pode ser concluído
    // e também atualizar o estoque de itens pendentes que compartilham o mesmo produto.
    const novosPedidos = pedidos.map(p => {
      return {
        ...p,
        itens_pedido: p.itens_pedido.map(i => {
          let itemAtualizado = { ...i };
          
          // Se for o item atualizado, define o novo status e quantidade
          if (i.id === itemId) {
            itemAtualizado.status = status;
            itemAtualizado.quantidade_atendida = qtdAtendida;
          }
          
          // Se o produto sofreu abatimento de estoque, atualiza a exibição local em todos os itens
          if (status === 'atendido' && produtoId && itemAtualizado.produto?.id === produtoId) {
            itemAtualizado.produto = {
              ...itemAtualizado.produto,
              quantidade_estoque: estoqueAtual - qtdAtendida
            };
          }
          
          return itemAtualizado;
        })
      };
    });

    setPedidos(novosPedidos);

    // Verificar se todos os itens deste pedido já foram resolvidos
    const pedidoAtualizado = novosPedidos.find(p => p.id === pedidoId);
    if (pedidoAtualizado) {
      const todosResolvidos = pedidoAtualizado.itens_pedido.every(i => i.status !== 'pendente');
      if (todosResolvidos) {
        // Atualizar status do pedido para processado
        await supabase
          .from('pedidos')
          .update({ status_geral: 'processado' })
          .eq('id', pedidoId);
          
        // Se estivermos na visão de pedido, recarregar tira da lista
        // Se estivermos na visão de produto, talvez seja melhor manter para não bagunçar a lista enquanto o usuário mexe
        if (viewMode === 'pedido') {
          carregarPedidos();
        }
      }
    }
  };

  // Agrupar itens por produto para a visão "Por Produto"
  const itensAgrupadosPorProduto = pedidos.reduce((acc, pedido) => {
    pedido.itens_pedido.forEach(item => {
      if (item.status !== 'pendente') return; // Só agrupar os pendentes
      
      const produtoId = item.produto_id;
      if (!acc[produtoId]) {
        acc[produtoId] = {
          produto: item.produto,
          solicitacoes: [],
          totalSolicitado: 0
        };
      }
      acc[produtoId].solicitacoes.push({
        ...item,
        solicitante_nome: pedido.solicitante_nome,
        departamento: pedido.departamento,
        pedido_id: pedido.id
      });
      acc[produtoId].totalSolicitado += item.quantidade_solicitada;
    });
    return acc;
  }, {} as Record<string, { 
    produto: Database['public']['Tables']['produtos']['Row'], 
    solicitacoes: (Database['public']['Tables']['itens_pedido']['Row'] & { solicitante_nome: string, departamento: string, pedido_id: string })[],
    totalSolicitado: number 
  }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 w-full h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Triagem de Pedidos</h1>
          <p className="text-slate-500 text-sm">Analise e atenda os pedidos pendentes</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('pedido')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'pedido' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Por Pedido
          </button>
          <button 
            onClick={() => setViewMode('produto')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'produto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Por Produto
          </button>
        </div>
      </div>

      {pedidos.length === 0 || (viewMode === 'produto' && Object.keys(itensAgrupadosPorProduto).length === 0) ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Check className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700">Tudo limpo por aqui!</p>
          <p>Não há pedidos pendentes para triagem.</p>
        </div>
      ) : viewMode === 'pedido' ? (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const itemsPendente = pedido.itens_pedido.filter(i => i.status === 'pendente');
            if (itemsPendente.length === 0) return null; // Ocultar pedidos já resolvidos nesta view

            const isExpanded = expandidos[pedido.id];
            const itemsAmount = pedido.itens_pedido.length;
            const itemsResolvedCount = pedido.itens_pedido.filter(i => i.status !== 'pendente').length;
            const progressPercent = Math.round((itemsResolvedCount / itemsAmount) * 100);

            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Accordion Header */}
                <div 
                  className={`p-4 flex cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50'}`}
                  onClick={() => toggleExpandir(pedido.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 text-slate-800">
                      <span className="font-bold text-lg">{pedido.solicitante_nome}</span>
                      <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">SIAPE: {pedido.solicitante_siape}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">{pedido.departamento}</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-slate-500">
                      <span>Criado em: {new Date(pedido.criado_em).toLocaleString()}</span>
                      <span className="flex items-center">
                        <span className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden mr-2 inline-block">
                          <span className="h-full bg-blue-500 block" style={{ width: `${progressPercent}%` }}></span>
                        </span>
                        {itemsResolvedCount} / {itemsAmount} itens verificados
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 flex items-center">
                    {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <table className="w-full text-sm text-left text-slate-600">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Produto</th>
                          <th className="px-4 py-3 text-center">Solicitado</th>
                          <th className="px-4 py-3 text-center">Estoque Atual</th>
                          <th className="px-4 py-3 text-right rounded-tr-lg rounded-br-lg">Decisão</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pedido.itens_pedido.map(item => (
                          <ItemTriagemLinha 
                            key={item.id} 
                            item={item} 
                            pedidoId={pedido.id} 
                            onResolvido={resolverItem} 
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Visão Por Produto */
        <div className="space-y-6">
          {Object.entries(itensAgrupadosPorProduto).map(([produtoId, data]) => (
            <div key={produtoId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 p-4 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-bold">{data.produto.nome}</h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-300 mt-1">
                    <span>Cód: {data.produto.id.substring(0, 8).toUpperCase()}</span>
                    <span>Unidade: {data.produto.unidade}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${data.produto.quantidade_estoque >= data.totalSolicitado ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                      Estoque: {data.produto.quantidade_estoque}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Total Solicitado</span>
                  <span className="text-2xl font-black">{data.totalSolicitado}</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Solicitante</th>
                      <th className="px-6 py-3">Setor</th>
                      <th className="px-6 py-3 text-center">Qtd Solicitada</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.solicitacoes.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{item.solicitante_nome}</td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{item.departamento}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700">{item.quantidade_solicitada}</td>
                        <td className="px-6 py-4 text-right">
                          <AcaoSimplificadaItem 
                            item={item} 
                            estoqueDisponivel={data.produto.quantidade_estoque}
                            onResolvido={resolverItem}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para ação rápida na visão por produto
const AcaoSimplificadaItem = ({ item, estoqueDisponivel, onResolvido }: {
  item: any,
  estoqueDisponivel: number,
  onResolvido: (itemId: string, pedidoId: string, status: 'atendido' | 'rejeitado', qtdAtendida: number) => void
}) => {
  const [qtd, setQtd] = useState(item.quantidade_solicitada);
  
  return (
    <div className="flex items-center justify-end space-x-2">
      <input
        type="number"
        min="1"
        max={estoqueDisponivel}
        value={qtd}
        onChange={(e) => setQtd(Number(e.target.value))}
        className="w-14 h-7 text-center text-xs border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
      <button
        onClick={() => onResolvido(item.id, item.pedido_id, 'atendido', qtd)}
        disabled={qtd > estoqueDisponivel || qtd < 1}
        className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[10px] transition-colors disabled:opacity-50"
      >
        OK
      </button>
      <button
        onClick={() => onResolvido(item.id, item.pedido_id, 'rejeitado', 0)}
        className="h-7 px-2 bg-slate-200 hover:bg-red-600 hover:text-white text-slate-600 rounded font-bold text-[10px] transition-colors"
      >
        X
      </button>
    </div>
  );
};

// Componente para a linha do item, gerenciando seu próprio estado de quantidade de atendimento
const ItemTriagemLinha = ({ item, pedidoId, onResolvido }: { 
  item: PedidoComItens['itens_pedido'][0], 
  pedidoId: string, 
  onResolvido: (itemId: string, pedidoId: string, status: 'atendido' | 'rejeitado', qtdAtendida: number) => void 
}) => {
  const [qtd, setQtd] = useState(item.quantidade_solicitada);

  if (item.status !== 'pendente') {
    return (
      <tr className="bg-slate-50 border-white">
        <td className="px-4 py-3 font-medium text-slate-700">{item.produto?.nome || 'Produto Indisponível'}</td>
        <td className="px-4 py-3 text-center">{item.quantidade_solicitada}</td>
        <td className="px-4 py-3 text-center">-</td>
        <td className="px-4 py-3 text-right">
          {item.status === 'atendido' ? (
            <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
              <Check className="h-3 w-3 mr-1" />
              Atendido ({item.quantidade_atendida})
            </span>
          ) : (
            <span className="inline-flex items-center text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-semibold">
              <X className="h-3 w-3 mr-1" />
              Rejeitado
            </span>
          )}
        </td>
      </tr>
    );
  }

  // Se o item está pendente
  const estoqueAtual = item.produto?.quantidade_estoque || 0;
  
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-800">{item.produto?.nome || 'Produto Removido'}</div>
        <div className="text-xs text-slate-500">Unidade: {item.produto?.unidade}</div>
      </td>
      <td className="px-4 py-3 text-center font-medium">
        {item.quantidade_solicitada}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`px-2 py-1 rounded text-xs font-bold ${estoqueAtual >= item.quantidade_solicitada ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          {estoqueAtual}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end space-x-2">
          <input
            type="number"
            min="1"
            max={estoqueAtual}
            value={qtd}
            onChange={(e) => setQtd(Number(e.target.value))}
            className="w-16 h-8 text-center text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => onResolvido(item.id, pedidoId, 'atendido', qtd)}
            disabled={qtd > estoqueAtual || qtd < 1}
            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Atender
          </button>
          <button
            onClick={() => onResolvido(item.id, pedidoId, 'rejeitado', 0)}
            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-xs transition-colors cursor-pointer"
          >
            Rejeitar
          </button>
        </div>
      </td>
    </tr>
  );
};
