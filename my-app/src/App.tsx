import './index.css'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Kits from './pages/Kit/Kits'
import Doce from './pages/Doces/Doces'
import Salgado from './pages/Salgados/Salgados'
import Bolo from './pages/Bolos/Bolos'
import Entregues from './pages/Entregue/Entregues'

export default function App() {
  return (
    <>
      <Sidebar />
      <div className="shell">
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kits" element={<Kits />} />
            <Route path="/doce" element={<Doce />} />
            <Route path="/salgado" element={<Salgado />} />
            <Route path="/bolo" element={<Bolo />} />
            <Route path="/historico" element={<Entregues />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
