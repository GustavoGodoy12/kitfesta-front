import styled from 'styled-components'

/* Paleta vibrante p/ estado FEITO */
const GREEN_BG    = '#b9fbc0';  // fundo base (vibrante)
const GREEN_BG_HV = '#a5f4b0';  // hover
const GREEN_BR    = '#10b981';  // borda
const GREEN_RING  = '#16a34a';  // halo/foco

export const CardKit = styled.article<{ $done?: boolean }>`
  position: relative;

  /* fundo e borda com verde mais vibrante quando $done */
  background: ${({ $done }) => ($done ? GREEN_BG : 'var(--card-bg, #f3f4f6)')};
  border: 1px solid ${({ $done }) => ($done ? GREEN_BR : 'var(--border)')};
  border-radius: 16px;
  padding: 16px;
  padding-bottom: ${({ $done }) => ($done ? '36px' : '16px')};
  display: grid;
  gap: 10px;
  transition:
    transform .12s ease,
    box-shadow .12s ease,
    background .2s ease,
    border-color .12s ease,
    filter .2s ease;
  cursor: pointer;

  /* leve brilho interno p/ dar “punch” no verde quando FEITO */
  ${({ $done }) =>
    $done
      ? `
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.35),
      0 6px 16px rgba(16,185,129,0.18);
  `
      : `
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  `}

  &:hover {
    transform: translateY(-2px);
    background: ${({ $done }) => ($done ? GREEN_BG_HV : '#eef2f7')};
    border-color: ${({ $done }) => ($done ? GREEN_BR : 'var(--orange)')};
    /* um pouco mais de destaque no hover quando FEITO */
    ${({ $done }) =>
      $done
        ? `box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 10px 22px rgba(16,185,129,0.25);`
        : `box-shadow: 0 6px 16px rgba(0,0,0,.06);`}
  }

  &:focus-visible { outline: 3px solid ${GREEN_RING}; }
`

/** Selo “FEITO” — canto inferior esquerdo (mantido) */
export const DoneRibbon = styled.div`
  position: absolute;
  left: 12px;
  bottom: 10px;
  z-index: 2;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #0ea5a5 120%);
  color: #ffffff;
  font-weight: 900;
  letter-spacing: .6px;
  font-size: 12px;
  padding: 7px 14px;
  border-radius: 10px;
  box-shadow:
    0 6px 16px rgba(34, 197, 94, 0.35),
    inset 0 1px 0 rgba(255,255,255,.2);
  pointer-events: none;

  &:after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    width: 0; height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid rgba(22, 163, 74, 0.95);
    transform: translateY(-50%);
  }
`

export const UndoCorner = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  height: 28px;
  min-width: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #16a34a;
  background: #dcfce7;
  color: #065f46;
  font-size: 14px;
  line-height: 26px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover { filter: brightness(0.98); }
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
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  margin-top: auto;

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
