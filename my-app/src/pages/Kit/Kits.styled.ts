import styled from 'styled-components'

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const Title = styled.h1`
  margin: 0;
  color: var(--text);
`

export const Subtitle = styled.p`
  margin: 0 0 8px 0;
  color: var(--muted);
`

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`

export const LeftGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

export const RightGroup = styled.div`
  /* Alinha tudo em uma única linha, com rolagem horizontal quando apertar */
  --ctrl-h: 44px;

  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;

  /* garante mesma altura visual dos controles */
  & input, & select, & button {
    height: var(--ctrl-h);
  }
`

export const Button = styled.button`
  /* tamanhos fixos */
  --btn-h: 44px;
  --btn-w: 120px;

  height: var(--btn-h);
  min-width: var(--btn-w);

  padding: 0 12px;
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

  &:hover { filter: brightness(0.98); }

  @media (max-width: 520px) {
    --btn-w: 100px;
    --btn-h: 40px;
    font-size: 0.9rem;
  }
`;

export const DateInput = styled.input`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
`

export const GridCards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 900px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
`

export const FormGrid = styled.form`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`

export const Field = styled.label`
  display: grid;
  gap: 6px;
  margin: 0; /* remove qualquer espaço extra */
`

export const Label = styled.span`
  color: var(--text);
  font-size: .95rem;
  line-height: 1.1;
  white-space: nowrap;
`

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
`

export const Select = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
`

export const Divider = styled.hr`
  grid-column: 1 / -1;
  border: none;
  height: 1px;
  background: var(--border);
  margin: 8px 0;
`

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,.35);
  backdrop-filter: blur(1.5px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`

export const ModalCard = styled.div`
  position: relative;
  max-width: 900px;
  width: min(900px, 92vw);
  max-height: 88vh;
  overflow: auto;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
`

export const ModalTitle = styled.h3`
  margin: 0 0 8px 0;
  color: var(--text);
`

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

export const BadgeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .badge {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .remove {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0 4px;
  }
`

export const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
