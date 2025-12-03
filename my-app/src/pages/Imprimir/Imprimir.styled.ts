import styled, { createGlobalStyle } from 'styled-components'
import { Button as BaseButton } from '../../components/Button'
import {
  CategoryGrid as BaseCategoryGrid,
  CategoryCard as BaseCategoryCard,
  CategoryHeader as BaseCategoryHeader,
  CategoryDay as BaseCategoryDay,
  CategoryNumber as BaseCategoryNumber,
  CategoryTitle as BaseCategoryTitle,
  CategoryMeta as BaseCategoryMeta,
  MetaRow as BaseMetaRow,
  MetaLabel as BaseMetaLabel,
  MetaValue as BaseMetaValue,
  ItemRow as BaseItemRow,
  CommentsArea as BaseCommentsArea,
  CommentsLabel as BaseCommentsLabel,
} from '../Cadastro/Cadastro.styled'

export const Wrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: calc(100vh - 100px);
  font-weight: 700;
  color: #111827;
`

/* TOPO – BUSCA + BOTÕES (somem na impressão) */

export const TopPanel = styled.section`
  background: #ffffff;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  display: inline-flex;
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
  flex-wrap: nowrap;
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
  width: 190px;
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

export const TopBottomRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
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
  min-width: 120px;

  &:hover {
    background: #ea580c;
  }
`

export const SearchButton = styled(BaseButton)`
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
  min-width: 100px;

  &:hover {
    background: #d1d5db;
  }
`

/* CARDS – reuso da estrutura do cadastro, mas com body próprio */

export const CardsSection = styled.section`
  flex: 1;
  display: flex;
`

export const CategoryGrid = styled(BaseCategoryGrid)``
export const CategoryCard = styled(BaseCategoryCard)``
export const CategoryHeader = styled(BaseCategoryHeader)``
export const CategoryDay = styled(BaseCategoryDay)``

/* Número do pedido em verde */
export const CategoryNumber = styled(BaseCategoryNumber)`
  color: #16a34a; /* verde */
`

export const CategoryTitle = styled(BaseCategoryTitle)``
export const CategoryMeta = styled(BaseCategoryMeta)``
export const MetaRow = styled(BaseMetaRow)``
export const MetaLabel = styled(BaseMetaLabel)``

/* Valor com variações de cor (default, verde, azul) */
export const MetaValue = styled(BaseMetaValue)<{
  $variant?: 'default' | 'green' | 'blue'
}>`
  color: ${({ $variant }) =>
    $variant === 'green'
      ? '#16a34a'
      : $variant === 'blue'
      ? '#1d4ed8'
      : '#111827'};
`

/**
 * Body específico da tela de imprimir:
 * - sem column-count
 * - quem cuida das colunas é o ItemsGrid
 */
export const CategoryBodyPrint = styled.div`
  padding: 4px 6px 4px;
  flex: 1;
  overflow: hidden;
`

export const ItemsGrid = styled.div<{ $twoColumns: boolean }>`
  display: grid;
  grid-template-columns: ${({ $twoColumns }) => ($twoColumns ? '1fr 1fr' : '1fr')};
  column-gap: 4px;
  width: 100%;
  height: 100%;
`

export const ItemsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const ItemRow = styled(BaseItemRow)<{ $twoColumns?: boolean }>`
  grid-template-columns: ${({ $twoColumns }) =>
    $twoColumns ? 'minmax(0, 1fr) 42px 45px' : 'minmax(0, 1fr) 50px 55px'};
`

export const ItemText = styled.div<{ $twoColumns?: boolean }>`
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: ${({ $twoColumns }) => ($twoColumns ? '1px 3px' : '0 4px')};
  display: flex;
  align-items: ${({ $twoColumns }) => ($twoColumns ? 'flex-start' : 'center')};
  justify-content: flex-start;
  font-size: ${({ $twoColumns }) => ($twoColumns ? '0.8rem' : '0.9rem')};
  height: ${({ $twoColumns }) => ($twoColumns ? 'auto' : '26px')};
  min-height: 22px;
  line-height: 1.1;
  word-break: break-word;
  color: #111827;
  font-weight: 700;
`

export const ItemQtyText = styled(ItemText)`
  justify-content: flex-end;
  align-items: center;
  text-align: right;
`

export const ItemUnitText = styled(ItemText)`
  justify-content: center;
  align-items: center;
  text-align: center;
`

export const CommentsArea = styled(BaseCommentsArea)``
export const CommentsLabel = styled(BaseCommentsLabel)``

export const CommentsBox = styled.div`
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 3px 4px;
  font-size: 0.9rem;
  background: #f9fafb;
  min-height: 28px;
  max-height: 60px; /* limita o tamanho pra não estourar o card */
  line-height: 1.2;
  color: #111827;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* até 3 linhas no máximo */
  -webkit-box-orient: vertical;
  word-break: break-word;
`

/* ESTILOS GLOBAIS PARA IMPRESSÃO – só os 3 cards, em paisagem e maiores */

export const PrintStyles = createGlobalStyle`
  @media print {
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    html,
    body {
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
      gap: 0;
      display: flex;
      flex-direction: column;
    }

    ${CardsSection} {
      flex: 1;
      display: flex;
      padding: 0;
      margin: 0;
      align-items: stretch;
    }

    ${CategoryGrid} {
      width: 100%;
      height: 100%;
      align-items: stretch;
      grid-template-columns: repeat(3, 1fr);
    }

    ${CategoryCard} {
      box-shadow: none;
      border-radius: 0;
    }
  }
`
