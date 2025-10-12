// KitCard.styled.ts
import styled from 'styled-components'

export const CardKit = styled.article<{ $done?: boolean }>`
  position: relative;
  overflow: visible; /* deixa a ribbon sair do card */

  background: ${({ $done }) => ($done ? '#c6f6d5' : 'var(--card-bg, #f3f4f6)')};
  border: 1px solid ${({ $done }) => ($done ? '#059669' : 'var(--border)')};
  border-radius: 16px;

  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 16px;

  transition: transform .12s ease, box-shadow .12s ease, background .2s ease, border-color .12s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,.06);
    background: ${({ $done }) => ($done ? '#bff2cf' : '#eef2f7')};
    border-color: ${({ $done }) => ($done ? '#059669' : 'var(--orange)')};
  }

  &:focus-visible { outline: 3px solid var(--orange); }
`

export const UndoCorner = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  height: 28px;
  min-width: 28px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid #059669;
  background: #d1fae5;
  color: #065f46;
  font-size: 14px;
  line-height: 26px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  z-index: 3; /* acima da ribbon */

  &:hover { filter: brightness(0.98); }
`

/* Ribbon discreta no canto superior direito, fora da área do título */
export const DoneRibbon = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 72px;   /* caixa pequena no canto */
  height: 72px;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;

  /* escondemos o texto do elemento e desenhamos a faixa com ::before */
  color: transparent;
  font-size: 0;

  &::before {
    content: 'FEITO';
    position: absolute;
    top: 14px;           /* centraliza dentro da caixa */
    right: -24px;        /* puxa a tarja para fora */
    width: 120px;
    text-align: center;

    transform: rotate(45deg);
    background: #10b981;
    color: #ffffff;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: .4px;
    padding: 3px 0;
    
  }

  /* pontinhas (acabamento sutil) */
  &::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 0; height: 0;
    border-top: 10px solid #0ea97a;
    border-left: 10px solid transparent;
    transform: translate(0, 0);
    opacity: .9;
  }
`

export const KitHeader = styled.div`
  display: grid;
  gap: 4px;
  strong { color: var(--text); }
  small { color: var(--muted); }
`

export const StatRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  span {
    font-size: .9rem;
    color: var(--text);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 10px;
  }
`

export const CardActions = styled.div`
  margin-top: auto; /* cola o rodapé no fim */

  position: relative;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;

  min-height: 48px;
  padding-top: 4px;

  & > button {
    height: 44px;
    min-width: 120px;
    padding: 0 12px;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    & > button {
      height: 40px;
      min-width: 100px;
    }
  }
`;

export const DangerButton = styled.button`
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: #fff;
  color: #b91c1c;
  cursor: pointer;
  &:hover { filter: brightness(0.98); }
`

export const Muted = styled.span`
  color: var(--muted);
  font-size: .95rem;
`
