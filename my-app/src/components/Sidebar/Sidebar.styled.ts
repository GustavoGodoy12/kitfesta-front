import styled, { css } from 'styled-components'
import { NavLink } from 'react-router-dom'

/**
 * Usa variáveis de cor do index.css (tema claro).
 */

export const Wrapper = styled.aside<{ $collapsed: boolean }>`
  position: fixed;
  inset: 0 auto 0 0; /* top:0; left:0; bottom:0 */
  width: var(--sidebar-w);
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: width .2s ease;

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      width: var(--sidebar-w-sm);
    `}
`

export const Brand = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: 36px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);

  span {
    opacity: 1;
    transition: opacity 0.2s ease;
    white-space: nowrap;
    font-weight: 700;
    color: var(--text);
  }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      grid-template-columns: 36px;
      span { opacity: 0; }
    `}
`

export const LogoImg = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--orange);
`

export const Toggle = styled.button<{ $collapsed: boolean }>`
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  padding: 8px 10px;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background .2s ease, border-color .2s ease, transform .2s ease;

  .chevron {
    display: inline-block;
    transition: transform .2s ease;
    ${({ $collapsed }) => $collapsed && css` transform: rotate(180deg); `}
  }

  .label { transition: opacity .2s ease; }
  ${({ $collapsed }) => $collapsed && css` .label { opacity: 0; width: 0; } `}

  &:hover { background: var(--surface-2); }
`

export const Nav = styled.nav`
  display: grid;
  gap: 6px;
`

export const NavItem = styled(NavLink)<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background .2s ease, border-color .2s ease;

  &:hover { background: var(--surface-2); }
  &.active { background: var(--surface-2); border-color: var(--border); }

  span { opacity: 1; transition: opacity .2s ease; }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      grid-template-columns: 28px;
      span { opacity: 0; }
    `}
`

export const ItemIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  color: var(--orange);
  font-size: 16px;
`
