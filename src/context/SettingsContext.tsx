import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Settings {
  controle_estoque: boolean;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSetting: (key: string, value: any) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    controle_estoque: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('configuracoes')
        .select('*');
      
      if (error) throw error;

      const newSettings: Settings = { ...settings };
      (data as any[])?.forEach((cfg) => {
        if (cfg.key === 'controle_estoque') {
          newSettings.controle_estoque = cfg.value.enabled;
        }
      });
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await (supabase as any)
        .from('configuracoes')
        .upsert({ key, value });
      
      if (error) throw error;
      
      // Update local state
      if (key === 'controle_estoque') {
        setSettings(prev => ({ ...prev, controle_estoque: value.enabled }));
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
