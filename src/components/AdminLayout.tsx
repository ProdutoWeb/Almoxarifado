import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, CheckSquare, Truck, LogOut, ShieldAlert, History } from 'lucide-react';
import clsx from 'clsx';

export const AdminLayout = () => {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, mas NÃO for admin, joga para a solicitação
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Catálogo', path: '/admin/catalogo', icon: Package },
    { name: 'Triagem', path: '/admin/triagem', icon: CheckSquare },
    { name: 'Logística', path: '/admin/logistica', icon: Truck },
    { name: 'Histórico', path: '/admin/historico', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-slate-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl tracking-tight">Almoxarifado ADMIN</span>
            </div>
            
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="ml-4 pl-4 border-l border-slate-700 flex items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
