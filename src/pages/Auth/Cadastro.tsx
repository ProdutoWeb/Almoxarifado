import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

export const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [siape, setSiape] = useState('');
  const [setor, setSetor] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    // Validação de e-mail p/ domínio UFES
    if (!email.toLowerCase().includes('ufes.br')) {
      setErro('Acesso restrito: Por favor, utilize um e-mail institucional válido (@ufes.br ou derivados).');
      return;
    }

    setLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            siape: siape,
            setor: setor,
          }
        }
      });

      if (error) {
        setErro(error.message);
      } else if (data.user && data.session) {
        // Se a criação da conta já realizar o auto-login (quando e-mail confirmation está desativado no Supabase)
        navigate('/');
      } else {
        // Se e-mail confirmation estiver ligado no Supabase
        alert('✅ Registo no Almoxarifado Fácil concluído!\n\nEnviámos um e-mail de confirmação para o seu endereço institucional. Por favor, verifique a sua caixa de entrada (e a pasta de spam) e clique no link de confirmação para ativar a sua conta.\n\nSó após a confirmação poderá fazer login no sistema.');
        navigate('/login');
      }
    } catch (err) {
      setErro('Almoxarifado Fácil: Ocorreu um erro inesperado ao tentar criar a sua conta. Por favor, tente novamente mais tarde ou contacte o suporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 w-full">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200 mt-8 mb-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Criar Conta Institucional</h2>
          <p className="text-slate-500 text-sm mt-1 text-center">Para fazer solicitações, preencha os dados abaixo.</p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-4">
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Institucional</label>
            <input
              type="email"
              required
              className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-2.5 border-slate-300 text-slate-900 bg-slate-50 outline-none"
              placeholder="exemplo@ufes.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha Segura</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-2.5 border-slate-300 text-slate-900 bg-slate-50 outline-none"
              placeholder="Insira no mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SIAPE</label>
              <input
                type="text"
                required
                className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-2.5 border-slate-300 text-slate-900 bg-slate-50 outline-none"
                placeholder="Ex: 1234567"
                value={siape}
                onChange={(e) => setSiape(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setor / Departamento</label>
              <input
                type="text"
                required
                className="w-full border shadow-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 p-2.5 border-slate-300 text-slate-900 bg-slate-50 outline-none"
                placeholder="Ex: TI"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 bg-blue-600 text-white font-medium py-3 rounded-lg transition flex items-center justify-center shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
          >
            {loading ? 'Criando conta...' : 'Registrar Conta'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            Já possui cadastro?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
