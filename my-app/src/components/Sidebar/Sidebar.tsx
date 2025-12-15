import { Brand, ItemIcon, LogoImg, Nav, NavItem, Wrapper } from './Sidebar.styled'
import logo from '../../assets/logo.png'

export default function Sidebar() {
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

      </Nav>
    </Wrapper>
  )
}
