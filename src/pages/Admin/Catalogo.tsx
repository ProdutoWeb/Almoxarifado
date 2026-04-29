import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Plus, Pencil, Trash2, Search, X, Upload } from 'lucide-react';
import Papa from 'papaparse';

type Produto = Database['public']['Tables']['produtos']['Row'];

export const Catalogo = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Partial<Produto> | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importando, setImportando] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

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

  const mostrarToast = (texto: string, tipo: 'sucesso' | 'erro') => {
    setToastMessage({ texto, tipo });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Extrair as colunas corretas e mapear para o formato do bd
          // Mapeamento: 'DESCRIÇÃO DO ITEM' -> nome, 'FORNECIMENTO' -> unidade
          const itensParaImportar: Database['public']['Tables']['produtos']['Insert'][] = results.data
            .map((row: any) => {
              const nome = row['DESCRIÇÃO DO ITEM']?.trim();
              const unidade = row['FORNECIMENTO']?.trim();

              if (!nome || !unidade) return null;

              return {
                nome,
                unidade,
                quantidade_estoque: 0,
                is_active: true,
                codigo: null,
                observacao: null
              };
            })
            .filter(Boolean) as Database['public']['Tables']['produtos']['Insert'][];

          if (itensParaImportar.length === 0) {
            mostrarToast('Nenhum item válido encontrado no CSV.', 'erro');
            setImportando(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }

          // Inserir os produtos usando upsert para ignorar duplicados por nome
          const { data, error } = await supabase
            .from('produtos')
            .upsert(itensParaImportar, { 
              onConflict: 'nome', 
              ignoreDuplicates: true 
            })
            .select();

          if (error) throw error;
          
          const inseridos = data ? data.length : 0;
          const ignorados = itensParaImportar.length - inseridos;
          
          mostrarToast(`${inseridos} produtos inseridos, ${ignorados} ignorados (duplicados).`, 'sucesso');
          carregarProdutos();
        } catch (error) {
          console.error('Erro na importação:', error);
          mostrarToast('Erro ao importar produtos.', 'erro');
        } finally {
          setImportando(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Erro ao ler CSV:', error);
        mostrarToast('Erro ao ler arquivo CSV.', 'erro');
        setImportando(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const abrirModalNovo = () => {
    setProdutoEditando({ nome: '', descricao: '', unidade: 'UN', quantidade_estoque: 0, is_active: true, codigo: '' });
    setModalAberto(true);
  };

  const abrirModalEditar = (produto: Produto) => {
    setProdutoEditando(produto);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setProdutoEditando(null);
  };

  const salvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando) return;
    setSalvando(true);

    try {
      if (produtoEditando.id) {
        const { error } = await supabase
          .from('produtos')
          .update({
            nome: produtoEditando.nome,
            descricao: produtoEditando.descricao,
            unidade: produtoEditando.unidade,
            quantidade_estoque: produtoEditando.quantidade_estoque,
            is_active: produtoEditando.is_active,
            codigo: produtoEditando.codigo || null
          })
          .eq('id', produtoEditando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert({
            nome: produtoEditando.nome!,
            descricao: produtoEditando.descricao,
            unidade: produtoEditando.unidade!,
            quantidade_estoque: produtoEditando.quantidade_estoque || 0,
            is_active: produtoEditando.is_active !== undefined ? produtoEditando.is_active : true,
            codigo: produtoEditando.codigo || null
          });
        if (error) throw error;
      }
      fecharModal();
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Almoxarifado Fácil: Erro ao salvar o produto no catálogo. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const toggleVisibilidade = async (produto: Produto) => {
    setToggling(produto.id);
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ is_active: !produto.is_active })
        .eq('id', produto.id);
      
      if (error) throw error;
      
      setProdutos(produtos.map(p => 
        p.id === produto.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      mostrarToast('Erro ao alterar status do produto.', 'erro');
    } finally {
      setToggling(null);
    }
  };

  const excluirProduto = async (id: string) => {
    if (!window.confirm('Almoxarifado Fácil — Exclusão de Produto\n\nTem a certeza de que deseja excluir este produto do catálogo? Esta ação não poderá ser desfeita.')) return;
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Almoxarifado Fácil: Não foi possível excluir o produto. É provável que existam pedidos vinculados a este item.');
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 flex items-center transition-all ${
          toastMessage.tipo === 'sucesso' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toastMessage.texto}
          <button onClick={() => setToastMessage(null)} className="ml-4 text-white hover:text-slate-200 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catálogo de Produtos</h1>
          <p className="text-slate-500 text-sm">Gerencie os itens disponíveis para solicitação</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importando}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-sm cursor-pointer disabled:opacity-50"
          >
            {importando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-700 mr-2"></div>
            ) : (
              <Upload className="h-5 w-5 mr-2" />
            )}
            Importar CSV
          </button>
          <button
            onClick={abrirModalNovo}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-sm cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500 outline-none text-sm transition-shadow"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Código</th>
                <th className="px-6 py-4">Nome / Descrição</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Visível</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className={`hover:bg-slate-50 transition-colors ${!produto.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">
                      {produto.codigo || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{produto.nome}</div>
                      <div className="text-slate-500 text-xs mt-1 truncate max-w-xs">{produto.descricao || '-'}</div>
                      {produto.observacao && (
                        <div className="text-amber-600 text-xs mt-1 font-medium bg-amber-50 inline-block px-1 rounded">{produto.observacao}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-200 text-slate-700 py-1 px-2 rounded font-medium text-xs">
                        {produto.unidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {produto.quantidade_estoque}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVisibilidade(produto)}
                        disabled={toggling === produto.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          produto.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                        } ${toggling === produto.id ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            produto.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => abrirModalEditar(produto)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => excluirProduto(produto.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && produtoEditando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {produtoEditando.id ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={salvarProduto} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    value={produtoEditando.nome || ''}
                    onChange={e => setProdutoEditando({...produtoEditando, nome: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código (SIE)</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    value={produtoEditando.codigo || ''}
                    onChange={e => setProdutoEditando({...produtoEditando, codigo: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 min-h-[80px]"
                  value={produtoEditando.descricao || ''}
                  onChange={e => setProdutoEditando({...produtoEditando, descricao: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: UN, CX, PCT"
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    value={produtoEditando.unidade || ''}
                    onChange={e => setProdutoEditando({...produtoEditando, unidade: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    value={produtoEditando.quantidade_estoque || 0}
                    onChange={e => setProdutoEditando({...produtoEditando, quantidade_estoque: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center cursor-pointer"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
