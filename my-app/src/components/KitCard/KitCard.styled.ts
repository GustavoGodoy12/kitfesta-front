import styled from 'styled-components'

export const CardKit = styled.article<{ $done?: boolean }>`
  position: relative;
  background: ${({ $done }) => ($done ? '#ecfdf5' : 'var(--card-bg, #f3f4f6)')};
  border: 1px solid ${({ $done }) => ($done ? '#10b981' : 'var(--border)')};
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 10px;
  transition: transform .12s ease, box-shadow .12s ease, background .2s ease, border-color .12s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,.06);
    background: ${({ $done }) => ($done ? '#ecfdf5' : '#eef2f7')};
    border-color: ${({ $done }) => ($done ? '#10b981' : 'var(--orange)')};
  }

  &:focus-visible { outline: 3px solid var(--orange); }
`

export const UndoCorner = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;   /* <- antes era left; agora no canto direito */
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

  /* força consistência de tamanho para botões no rodapé */
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
