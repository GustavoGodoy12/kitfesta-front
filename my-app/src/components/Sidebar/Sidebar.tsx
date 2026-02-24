import { Brand, ItemIcon, LogoImg, Nav, NavItem, Wrapper } from './Sidebar.styled'
import logo from '../../assets/logo.png'
import { useAuth } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/relatorios/login')
  }

  return (
    <Wrapper aria-label="Barra de navegação principal">
      <Brand aria-label="Janine's">
        <LogoImg src={logo} alt="Logo Janine's" />
        <span>Sisteminha</span>
      </Brand>

      <Nav id="sidebar-nav" role="navigation" aria-label="Principal">
        <NavItem to="/cadastro" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>📝</ItemIcon>
          <span>CADASTRO</span>
        </NavItem>

        <NavItem to="/imprimir" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🖨️</ItemIcon>
          <span>IMPRIMIR</span>
        </NavItem>

        <NavItem to="/relacao" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>📋</ItemIcon>
          <span>RELAÇÃO</span>
        </NavItem>

        <NavItem to="/consolidado" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>📦</ItemIcon>
          <span>CONSOLIDADO</span>
        </NavItem>

        <NavItem to="/financeiro" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>💰</ItemIcon>
          <span>FINANCEIRO</span>
        </NavItem>

        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginTop: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: 8, padding: '10px 16px', color: '#dc2626', fontWeight: 700,
            }}
          >
            <span>🚪</span>
            <span>SAIR</span>
          </button>
        )}
      </Nav>
    </Wrapper>
  )
}