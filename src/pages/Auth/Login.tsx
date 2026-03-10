import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    const success = login(usuario, senha);
    if (success) {
      navigate('/admin/triagem');
    } else {
      setErro('Credenciais inválidas. Verifique o usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 w-full">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-900 p-3 rounded-full mb-4">
            <ShieldAlert className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Acesso Administrativo</h2>
          <p className="text-slate-500 text-sm mt-1">Insira suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Usuário</label>
            <input
              type="text"
              required
              className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-3 border-slate-300 text-slate-900 bg-slate-50 outline-none transition-shadow"
              placeholder="Digite o usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
            <input
              type="password"
              required
              className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-3 border-slate-300 text-slate-900 bg-slate-50 outline-none transition-shadow"
              placeholder="Digite a senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center shadow-md cursor-pointer"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Entrar no Sistema
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Almoxarifado Fácil &copy; 2026</p>
          <p>Uso restrito para servidores autorizados.</p>
        </div>
      </div>
    </div>
  );
};
