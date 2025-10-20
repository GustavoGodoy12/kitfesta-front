import './index.css'
import './App.css'

import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, useLocation } from 'react-router-dom'

import Home from './pages/Home'
import Kits from './pages/Kit/Kits'
import Doce from './pages/Doces/Doces'
import Salgado from './pages/Salgados/Salgados'
import Bolo from './pages/Bolos/Bolos'
import Entregues from './pages/Entregue/Entregues'
import Relatorios from './pages/Relatorios/Relatorios'

import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from './pages/Login/LoginPage' // <<< agora está em pages

export default function App() {
  const location = useLocation()
  const showSidebar = location.pathname !== '/relatorios/login'

  return (
    <AuthProvider>
      {showSidebar && <Sidebar />}
      <div className="shell">
        <main className="content">
          <Routes>
            {/* público */}
            <Route path="/" element={<Home />} />
            <Route path="/kits" element={<Kits />} />
            <Route path="/doce" element={<Doce />} />
            <Route path="/salgado" element={<Salgado />} />
            <Route path="/bolo" element={<Bolo />} />
            <Route path="/historico" element={<Entregues />} />

            {/* login dedicado para relatórios */}
            <Route path="/relatorios/login" element={<LoginPage />} />

            {/* protegido: se não estiver logado, vai para /relatorios/login?next=/relatorios */}
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute
                  allowEmails={['gabriel@janine.com.br', 'usuariox@exemplo.com']}
                  fallbackPath="/relatorios/login"
                >
                  <Relatorios />
                </ProtectedRoute>
              }
            />

            {/* 404 simples */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
