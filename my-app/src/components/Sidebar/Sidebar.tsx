import { useEffect, useState } from 'react'
import { Brand, ItemIcon, LogoImg, Nav, NavItem, Toggle, Wrapper } from './Sidebar.styled'
import logo from '../../assets/logo.png'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed)
  }, [collapsed])

  return (
    <Wrapper $collapsed={collapsed} aria-label="Barra lateral de navegação">
      <Brand $collapsed={collapsed} aria-label="Janine's">
        <LogoImg src={logo} alt="Logo Janine's" />
        <span>Janine&apos;s</span>
      </Brand>

      <Toggle
        type="button"
        onClick={() => setCollapsed(v => !v)}
        aria-expanded={!collapsed}
        aria-controls="sidebar-nav"
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        $collapsed={collapsed}
      >
        <span className="chevron">◀</span>
        <span className="label">Recolher</span>
      </Toggle>

      <Nav id="sidebar-nav" role="navigation" aria-label="Principal">
        <NavItem to="/" end $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🏠</ItemIcon>
          <span>Início</span>
        </NavItem>

        <NavItem to="/kits" $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🧺</ItemIcon>
          <span>Kits</span>
        </NavItem>

        <NavItem to="/doce" $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🍬</ItemIcon>
          <span>Doce</span>
        </NavItem>

        <NavItem to="/salgado" $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🥟</ItemIcon>
          <span>Salgado</span>
        </NavItem>

        <NavItem to="/bolo" $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🍰</ItemIcon>
          <span>Bolo</span>
        </NavItem>

        <NavItem to="/historico" $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>🕘</ItemIcon>
          <span>Histórico</span>
        </NavItem>

        <NavItem to="/relatorios" $collapsed={collapsed} className={({ isActive }) => (isActive ? 'active' : '')}>
          <ItemIcon>📈</ItemIcon>
          <span>Relatórios</span>
        </NavItem>
      </Nav>
    </Wrapper>
  )
}
