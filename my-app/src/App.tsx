import './index.css'
import './App.css'

import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, useLocation } from 'react-router-dom'
import Cadastro from './pages/Cadastro/Cadastro'
import Imprimir from './pages/Imprimir/Imprimir'
import Relacao from './pages/Relacao/Relacao'
import Consolidado from './pages/Consolidado/Consolidado'


import { AuthProvider } from './auth/AuthContext'



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
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/imprimir" element={<Imprimir />} />
            <Route path="/relacao" element={<Relacao />} />
            <Route path="/consolidado" element={<Consolidado />} />

          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
