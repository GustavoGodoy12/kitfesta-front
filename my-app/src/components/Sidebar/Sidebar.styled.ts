import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

/**
 * Usa variáveis de cor do index.css (tema claro).
 * Barra fixa no topo, navegação centralizada.
 */

export const Wrapper = styled.header`
  position: fixed;
  inset: 0 0 auto 0; /* top:0; left:0; right:0 */
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 20;
`

export const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  
  border: 1px solid var(--border);

  span {
    white-space: nowrap;
    font-weight: 700;
    color: var(--text);
  }
`

export const LogoImg = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--orange);
`

export const Nav = styled.nav`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;   /* centraliza os botões */
  gap: 6px;
  overflow-x: auto;
`

export const NavItem = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
  border-radius: 999px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--surface-2);
  }

  &.active {
    background: var(--surface-2);
    border-color: var(--border);
    font-weight: 600;
  }

  span {
    white-space: nowrap;
  }
`

export const ItemIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  color: var(--orange);
  font-size: 16px;
  flex-shrink: 0;
`
