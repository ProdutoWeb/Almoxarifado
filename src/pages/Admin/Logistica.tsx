import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Truck, PackageCheck, Send, Printer } from 'lucide-react';

type PedidoProcessado = Database['public']['Tables']['pedidos']['Row'] & {
  itens_pedido?: (Database['public']['Tables']['itens_pedido']['Row'] & {
    produto: Database['public']['Tables']['produtos']['Row']
  })[]
};

export const Logistica = () => {
  const [pedidos, setPedidos] = useState<PedidoProcessado[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado local para controle de separação na UI (para dupla checagem)
  const [separados, setSeparados] = useState<Record<string, boolean>>({});

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
        .eq('status_geral', 'processado')
        .eq('enviado', false)
        .order('departamento')
        .order('criado_em', { ascending: true });
      
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos para logística:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeparacao = (id: string) => {
    setSeparados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const despacharPedido = async (id: string) => {
    if (!window.confirm('Confirmar o envio deste pedido? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ enviado: true })
        .eq('id', id);

      if (error) throw error;
      
      // Remover do estado
      setPedidos(prev => prev.filter(p => p.id !== id));
      setSeparados(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (error) {
      console.error('Erro ao despachar pedido:', error);
      alert('Houve um erro ao registrar o envio.');
    }
  };

  const imprimirSetor = (departamento: string) => {
    const originalTitle = document.title;
    document.title = `Pedido_${departamento}_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    window.print();
    document.title = originalTitle;
  };

  // Agrupar pedidos por departamento
  const pedidosAgrupados = pedidos.reduce((acc, pedido) => {
    if (!acc[pedido.departamento]) {
      acc[pedido.departamento] = [];
    }
    acc[pedido.departamento].push(pedido);
    return acc;
  }, {} as Record<string, PedidoProcessado[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 w-full h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Logística e Despacho</h1>
            <p className="text-slate-500 text-sm">Controle a entrega física dos materiais processados</p>
          </div>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center no-print">
          <PackageCheck className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-700">Tudo despachado!</p>
          <p>Nenhum pedido aguardando logística no momento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(pedidosAgrupados).map(([departamento, listaPedidos]) => (
            <div key={departamento} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-after-page print:border-none print:shadow-none">
              <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between no-print">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  Setor: {departamento}
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => imprimirSetor(departamento)}
                    className="flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Guia
                  </button>
                  <span className="bg-slate-800 text-white px-3 py-1 text-sm font-semibold rounded-full">
                    {listaPedidos.length} {listaPedidos.length === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>
              </div>

              {/* Layout de Impressão (Visível apenas no print) */}
              <div className="hidden print:block p-8 space-y-12">
                {[1, 2].map((via) => (
                  <div key={via} className={via === 1 ? "border-b-2 border-dashed border-slate-300 pb-12" : ""}>
                    <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
                      <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Guia de Entrega - Almoxarifado</h1>
                        <p className="text-lg font-bold text-slate-700">Setor: {departamento}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300 uppercase italic">
                          {via}ª Via - {via === 1 ? 'Almoxarifado' : 'Setor'}
                        </span>
                        <p className="text-xs text-slate-500 mt-2">Emitido em: {new Date().toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {listaPedidos.map(pedido => (
                        <div key={pedido.id} className="border border-slate-200 rounded p-4">
                          <div className="flex justify-between border-b border-slate-100 pb-2 mb-3">
                            <span className="font-black text-slate-900 uppercase">Solicitante: {pedido.solicitante_nome}</span>
                            <span className="text-xs font-medium">SIAPE: {pedido.solicitante_siape}</span>
                          </div>
                          
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left border-b border-slate-200">
                                <th className="pb-1 uppercase text-[10px] font-bold">Produto</th>
                                <th className="pb-1 uppercase text-[10px] font-bold text-center w-20">Qtd Atendida</th>
                                <th className="pb-1 uppercase text-[10px] font-bold text-center w-20">Conferido</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {pedido.itens_pedido?.filter(i => i.status === 'atendido').map(item => (
                                <tr key={item.id}>
                                  <td className="py-2 text-slate-800 font-medium">
                                    {item.produto.nome}
                                    <span className="text-[10px] text-slate-400 ml-2 italic">({item.produto.id.substring(0,8).toUpperCase()})</span>
                                  </td>
                                  <td className="py-2 text-center font-black text-lg">{item.quantidade_atendida}</td>
                                  <td className="py-2 text-center">
                                    <div className="w-5 h-5 border border-slate-400 mx-auto rounded"></div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-12">
                      <div className="border-t border-slate-400 pt-2 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Assinatura do Responsável (Setor)</p>
                        <div className="mt-8 text-sm">Data: ____/____/________</div>
                      </div>
                      <div className="border-t border-slate-400 pt-2 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Assinatura do Almoxarife</p>
                        <div className="mt-8 text-sm">Horário: ____:____</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="divide-y divide-slate-100 no-print">
                {listaPedidos.map(pedido => {
                  const isSeparado = separados[pedido.id] || false;
                  
                  return (
                    <div key={pedido.id} className={`p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${isSeparado ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-800">{pedido.solicitante_nome}</h3>
                          {/* Detector de repetição visual */}
                          {listaPedidos.filter(p => p.solicitante_nome === pedido.solicitante_nome).length > 1 && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase animate-pulse">Solicitação Duplicada</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          SIAPE: <span className="font-medium text-slate-700">{pedido.solicitante_siape}</span> • 
                          Solicitado em: {new Date(pedido.criado_em).toLocaleDateString()}
                        </p>
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pedido.itens_pedido?.filter(i => i.status === 'atendido').map(item => (
                            <span key={item.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-medium">
                              {item.quantidade_atendida}x {item.produto.nome}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto mt-2 sm:mt-0">
                        <label className="flex items-center space-x-2 cursor-pointer touch-none select-none">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            checked={isSeparado}
                            onChange={() => toggleSeparacao(pedido.id)}
                          />
                          <span className="text-sm font-medium text-slate-700">Materiais Separados</span>
                        </label>
                        
                        <div className="w-px h-8 bg-slate-200"></div>
                        
                        <button
                          onClick={() => despacharPedido(pedido.id)}
                          disabled={!isSeparado}
                          className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 shadow-sm cursor-pointer"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Despachar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
