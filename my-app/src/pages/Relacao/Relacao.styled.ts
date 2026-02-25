import styled, { createGlobalStyle } from 'styled-components'
import { Button as BaseButton } from '../../components/Button'

export const Wrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: calc(100vh - 100px);
  font-weight: 700;
  color: #111827;
`

export const TopPanel = styled.section`
  background: #ffffff;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  display: flex;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 12px;
  align-items: stretch;

  @media print {
    display: none;
  }
`

export const TopRows = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  > div {
    flex: 0 0 auto;
  }
`

export const FieldLabel = styled.label`
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 2px;
  color: #111827;
  font-weight: 700;
`

export const FieldInput = styled.input`
  width: 180px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 5px 8px;
  font-size: 0.9rem;
  background: #f9fafb;
  outline: none;
  height: 32px;
  line-height: 1;
  color: #111827;
  font-weight: 700;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:focus {
    border-color: #f97316;
    background: #ffffff;
  }
`

export const DayBadge = styled.div`
  min-width: 140px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px dashed #d1d5db;
  background: #f3f4f6;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  color: #111827;
`

export const TopBottomRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`

export const GenerateButton = styled(BaseButton)`
  padding: 10px 18px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #111827;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  min-width: 140px;

  &:hover { background: #d1d5db; }
`

export const PrintButton = styled(BaseButton)`
  padding: 12px 24px;
  border-radius: 999px;
  background: #f97316;
  color: #111827;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  min-width: 160px;

  &:hover { background: #ea580c; }
`

export const TableSection = styled.section`
  flex: 1;
  display: flex;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  padding: 10px;
`

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`

export const RelacaoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
`

export const RelacaoThead = styled.thead`
  border-bottom: 2px solid #000000;
`

export const RelacaoHeaderCell = styled.th`
  padding: 4px 6px;
  text-align: left;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: #111827;
  font-weight: 700;
  white-space: nowrap;
`

export const RelacaoHeaderNumero = styled(RelacaoHeaderCell)`
  color: #ef4444;
`

export const RelacaoTbody = styled.tbody``

export const RelacaoRow = styled.tr<{ $entregue?: boolean; $entrega?: boolean }>`
  border-bottom: 1px solid #e5e7eb;
  background: ${p =>
    p.$entregue
      ? '#fef9c3'
      : p.$entrega
      ? '#dbeafe'
      : 'transparent'};

  &:nth-child(even) {
    background: ${p =>
      p.$entregue
        ? '#fef9c3'
        : p.$entrega
        ? '#dbeafe'
        : '#f9fafb'};
  }
`

export const RelacaoCell = styled.td`
  padding: 3px 6px;
  font-size: 0.78rem;
  color: #111827;
  font-weight: 600;
  white-space: nowrap;
`

export const RelacaoCellNumero = styled(RelacaoCell)`
  color: #16a34a;
`

export const PrintStyles = createGlobalStyle`
  @media print {
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    ${Wrapper} {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #ffffff;
      padding: 0;
      gap: 6px;
      display: flex;
      flex-direction: column;
    }

    ${TableSection} {
      box-shadow: none;
      border-radius: 0;
      padding: 4px;
    }
  }
`