import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { Solicitacao } from './pages/Public/Solicitacao';
import { Login } from './pages/Auth/Login';
import { Catalogo } from './pages/Admin/Catalogo';
import { Triagem } from './pages/Admin/Triagem';
import { Logistica } from './pages/Admin/Logistica';
import { Historico } from './pages/Admin/Historico';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Solicitacao />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/triagem" replace />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="triagem" element={<Triagem />} />
            <Route path="logistica" element={<Logistica />} />
            <Route path="historico" element={<Historico />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
