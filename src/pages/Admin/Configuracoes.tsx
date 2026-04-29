import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const Configuracoes = () => {
  const { settings, updateSetting } = useSettings();
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const handleToggleEstoque = async (enabled: boolean) => {
    setSalvando(true);
    setMensagem(null);
    try {
      await updateSetting('controle_estoque', { enabled });
      setMensagem({ texto: 'Configuração de estoque atualizada com sucesso!', tipo: 'sucesso' });
    } catch (error) {
      setMensagem({ texto: 'Erro ao salvar configuração.', tipo: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-slate-500 text-sm">Personalize o comportamento global do Almoxarifado Fácil</p>
      </div>

      <div className="space-y-6">
        {/* Card Controle de Estoque */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Módulo de Controle de Estoque</h3>
                <p className="text-slate-500 text-sm max-w-2xl">
                  Define se o sistema deve rastrear e validar as quantidades em estoque durante a triagem. 
                  Quando desativado, o sistema permitirá o atendimento de qualquer quantidade solicitada sem verificar disponibilidade.
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleToggleEstoque(!settings.controle_estoque)}
                  disabled={salvando}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    settings.controle_estoque ? 'bg-emerald-500' : 'bg-slate-300'
                  } ${salvando ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.controle_estoque ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {settings.controle_estoque ? (
              <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Modo Controle Ativo</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    O sistema exige que haja saldo em estoque para autorizar entregas. 
                    As colunas de "Estoque" são exibidas no Catálogo e na Triagem.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Modo Fluxo Livre (Apenas Pedidos)</p>
                  <p className="text-xs text-blue-700 mt-1">
                    O sistema funcionará como uma fila de solicitações. 
                    Nenhuma validação de estoque será feita e as colunas de saldo serão ocultadas da interface.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {mensagem && (
            <div className={`px-6 py-3 border-t flex items-center text-sm font-medium ${
              mensagem.tipo === 'sucesso' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {mensagem.texto}
            </div>
          )}
        </div>

        {/* Outras configurações futuras podem ser adicionadas aqui */}
        <div className="bg-slate-100 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-400 text-sm font-medium">Novas configurações "SaaS" serão adicionadas aqui em futuras atualizações.</p>
        </div>
      </div>
    </div>
  );
};
