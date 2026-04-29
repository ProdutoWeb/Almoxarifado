import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { History, Search, Calendar } from 'lucide-react';

type PedidoComItens = Database['public']['Tables']['pedidos']['Row'] & {
  itens_pedido: (Database['public']['Tables']['itens_pedido']['Row'] & {
    produto: Database['public']['Tables']['produtos']['Row']
  })[]
};

export const Historico = () => {
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
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
        .eq('enviado', true)
        .order('criado_em', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setPedidos((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(p => 
    p.solicitante_nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.departamento.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.solicitante_siape.includes(termoBusca)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 w-full h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Histórico de Saídas</h1>
            <p className="text-slate-500 text-sm">Registro de todos os itens já despachados e entregues</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, siape ou setor..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 w-full border border-slate-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg bg-white shadow-sm text-sm"
          />
        </div>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700">Nenhum registro encontrado</p>
          <p>Não há pedidos despachados que correspondam à sua busca.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4">Solicitante</th>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4">Itens Despachados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {new Date(pedido.despachado_em || pedido.criado_em).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(pedido.despachado_em || pedido.criado_em).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{pedido.solicitante_nome}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">SIAPE: {pedido.solicitante_siape}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">
                        {pedido.departamento}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-sm">
                        {pedido.itens_pedido.filter(i => i.status === 'atendido').map((item) => (
                          <div key={item.id} className="text-xs flex justify-between bg-white border border-slate-100 p-1.5 rounded">
                            <span className="truncate pr-2 font-medium" title={item.produto.nome}>{item.produto.nome}</span>
                            <span className="font-bold text-slate-800 bg-slate-100 px-1.5 rounded w-10 text-center">{item.quantidade_atendida}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
