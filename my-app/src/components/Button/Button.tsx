import React from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

type Props = {
  children: React.ReactNode
  className?: string
  title?: string
  ariaLabel?: string

  /** quando passado, renderiza como <Link> */
  to?: string

  /** props de <button> */
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler
  disabled?: boolean

  /** ocupa 100% da largura do contêiner */
  fullWidth?: boolean

  /** bloqueia clique/submit (estilo permanece igual ao original) */
  loading?: boolean
}

export default function Button({
  children,
  to,
  type = 'button',
  onClick,
  disabled,
  fullWidth,
  loading,
  className,
  title,
  ariaLabel,
}: Props) {
  const commonProps = { className, title, 'aria-label': ariaLabel } as any

  if (to) {
    return (
      <BaseLink
        to={to}
        $fullWidth={!!fullWidth}
        aria-disabled={disabled || loading}
        tabIndex={disabled || loading ? -1 : 0}
        {...commonProps}
      >
        <span>{children}</span>
      </BaseLink>
    )
  }

  return (
    <BaseButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      $fullWidth={!!fullWidth}
      aria-busy={loading ? true : undefined}
      {...commonProps}
    >
      <span>{children}</span>
    </BaseButton>
  )
}

/* ================= estilos idênticos aos botões antigos ================= */

const common = css<{ $fullWidth?: boolean }>`
  /* tamanhos fixos — iguais aos do Kits.styled */
  --btn-h: 44px;
  --btn-w: 120px;

  height: var(--btn-h);
  min-width: var(--btn-w);

  padding: 0 12px; /* altura fixa => padding vertical 0 */
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1;

  white-space: nowrap;
  text-align: center;
  color: var(--text);

  /* comportamento idêntico no hover */
  &:hover { filter: brightness(0.98); }

  /* disabled/loading: mantém o mesmo visual, só desabilita interação */
  &[aria-disabled='true'],
  &:disabled {
    pointer-events: none;
    opacity: .7;
    cursor: not-allowed;
  }

  /* full width opcional */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
    min-width: 0;
  `}

  @media (max-width: 520px) {
    /* igual ao original no mobile estreito */
    --btn-w: 100px;
    --btn-h: 40px;
    font-size: 0.9rem;
  }
`

const BaseButton = styled.button<{ $fullWidth?: boolean }>`
  ${common}
`

const BaseLink = styled(Link)<{ $fullWidth?: boolean }>`
  ${common}
  text-decoration: none;
`
