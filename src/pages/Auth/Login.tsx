import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErro('Credenciais inválidas. Verifique o E-mail e a Senha.');
      } else {
        // O AuthContext vai capturar a mudança de sessão e redirecionar adequadamente (ou o usuário vai ficar livre para navegar)
        navigate('/admin/triagem');
      }
    } catch (err) {
      setErro('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 w-full">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-900 p-3 rounded-full mb-4">
            <ShieldAlert className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Acesso ao Almoxarifado</h2>
          <p className="text-slate-500 text-sm mt-1">Insira suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">E-mail</label>
            <input
              type="email"
              required
              className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-3 border-slate-300 text-slate-900 bg-slate-50 outline-none transition-shadow"
              placeholder="seu.email@ufes.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            disabled={loading}
            className={`w-full bg-slate-900 text-white font-medium py-3 rounded-lg transition flex items-center justify-center shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 cursor-pointer'}`}
          >
            <LogIn className="h-5 w-5 mr-2" />
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>
            Novo por aqui?{' '}
            <Link to="/cadastro" className="text-blue-600 hover:text-blue-800 font-medium">
              Crie sua conta UFES
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
