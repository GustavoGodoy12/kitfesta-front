import styled, { keyframes } from 'styled-components'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
  animation: ${fadeUp} 0.3s ease;
`

export const FiltersPanel = styled.section`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
`

export const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

export const FilterLabel = styled.label`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6b7280;
`

export const FilterInput = styled.input`
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 0 9px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  background: #f9fafb;
  outline: none;
  min-width: 130px;

  &:focus {
    border-color: #f97316;
    background: #fff;
  }
`

export const FilterSelect = styled.select`
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 0 9px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  background: #f9fafb;
  outline: none;
  min-width: 130px;
  appearance: none;

  &:focus {
    border-color: #f97316;
    background: #fff;
  }
`

export const FilterButton = styled.button`
  height: 32px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: #f97316;
  color: #111827;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-end;

  &:hover { background: #ea580c; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

export const ClearButton = styled(FilterButton)`
  background: #e5e7eb;
  color: #374151;
  &:hover { background: #d1d5db; }
`

/* CARDS DE RESUMO */

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`

export const SummaryCard = styled.div<{ $color?: string }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  border-left: 4px solid ${p => p.$color ?? '#f97316'};
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: ${fadeUp} 0.35s ease both;
`

export const CardLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
`

export const CardValue = styled.span<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${p => p.$color ?? '#111827'};
  line-height: 1.1;
`

export const CardSub = styled.span`
  font-size: 0.72rem;
  color: #6b7280;
  font-weight: 600;
`

/* SEÇÃO DE GRÁFICOS */

export const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const ChartCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  animation: ${fadeUp} 0.4s ease both;
`

export const ChartTitle = styled.h3`
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin: 0 0 12px 0;
`

/* TABELA */

export const TableCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  animation: ${fadeUp} 0.45s ease both;
`

export const TableTitle = styled.h3`
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin: 0 0 12px 0;
`

export const TableWrapper = styled.div`
  overflow-x: auto;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
`

export const Thead = styled.thead`
  border-bottom: 2px solid #111827;
`

export const Th = styled.th`
  padding: 5px 8px;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #374151;
  white-space: nowrap;
`

export const Tbody = styled.tbody``

export const Tr = styled.tr<{ $entregue?: boolean }>`
  border-bottom: 1px solid #f3f4f6;
  background: ${p => p.$entregue ? '#fef9c3' : 'transparent'};

  &:nth-child(even) {
    background: ${p => p.$entregue ? '#fef9c3' : '#f9fafb'};
  }
`

export const Td = styled.td`
  padding: 4px 8px;
  font-size: 0.78rem;
  color: #111827;
  font-weight: 600;
  white-space: nowrap;
`

export const TdNumero = styled(Td)`
  color: #16a34a;
  font-weight: 800;
`

export const TdValor = styled(Td)`
  color: #f97316;
  font-weight: 800;
`

export const Badge = styled.span<{ $color?: string }>`
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${p => p.$color ?? '#e5e7eb'};
  color: ${p => p.$color ? '#fff' : '#374151'};
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 600;
`