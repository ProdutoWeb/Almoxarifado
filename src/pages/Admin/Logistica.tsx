import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Truck, PackageCheck, Send, Info } from 'lucide-react';

type PedidoProcessado = Database['public']['Tables']['pedidos']['Row'];

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
        .select('*')
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
      <div className="mb-6 flex items-center space-x-3">
        <div className="bg-slate-900 p-2 rounded-lg text-white">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Logística e Despacho</h1>
          <p className="text-slate-500 text-sm">Controle a entrega física dos materiais processados</p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center">
          <PackageCheck className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-700">Tudo despachado!</p>
          <p>Nenhum pedido aguardando logística no momento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(pedidosAgrupados).map(([departamento, listaPedidos]) => (
            <div key={departamento} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  Setor: {departamento}
                </h2>
                <span className="bg-slate-800 text-white px-3 py-1 text-sm font-semibold rounded-full">
                  {listaPedidos.length} {listaPedidos.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {listaPedidos.map(pedido => {
                  const isSeparado = separados[pedido.id] || false;
                  
                  return (
                    <div key={pedido.id} className={`p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${isSeparado ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{pedido.solicitante_nome}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          SIAPE: <span className="font-medium text-slate-700">{pedido.solicitante_siape}</span> • 
                          Solicitado em: {new Date(pedido.criado_em).toLocaleDateString()}
                        </p>
                        <div className="mt-2 text-xs text-blue-600 flex items-center">
                          <Info className="h-3 w-3 mr-1" />
                          Pedido processado e pronto para montagem física.
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
