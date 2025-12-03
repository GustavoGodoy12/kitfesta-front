import styled from 'styled-components'
import { Button as BaseButton } from '../../components/Button'

export const Wrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: calc(100vh - 100px);
  font-weight: 700;
  color: #111827;
`

/* TOPO – FORMULÁRIO (2/3 inputs, 1/3 botão) */

export const FormPanel = styled.section`
  background: #ffffff;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  display: inline-flex;
  flex-direction: row;
  gap: 12px;
  align-items: stretch;
`

export const FormRows = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const FormRow = styled.div`
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

export const PedidoIdBox = styled.div`
  min-width: 80px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px dashed #d1d5db;
  background: #f3f4f6;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  color: #111827;
`

export const FieldSelect = styled.select`
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
  appearance: none;

  &:focus {
    border-color: #f97316;
    background: #ffffff;
  }
`

export const FormBottomRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SubmitButton = styled(BaseButton)`
  padding: 12px 30px;
  border-radius: 999px;
  background: #f97316;
  color: #111827;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  min-width: 160px;

  &:hover {
    background: #ea580c;
  }
`

/* EMBAIXO – CARDS */

export const CardsSection = styled.section`
  flex: 1;
  display: flex;
`

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  align-items: stretch;
`

export const CategoryCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`

export const CategoryHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
`

export const CategoryDay = styled.div`
  background: #ffe600;
  font-weight: 700;
  text-align: center;
  padding: 6px 4px;
  font-size: 1rem;
  color: #111827;
`

export const CategoryNumber = styled.div`
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
`

export const CategoryTitle = styled.div`
  padding: 6px 8px 4px;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  color: #111827;
`

export const CategoryMeta = styled.div`
  padding: 2px 8px 4px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1px;
`

export const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
`

export const MetaLabel = styled.span`
  color: #111827;
  font-weight: 700;
`

export const MetaValue = styled.span`
  color: #111827;
  font-weight: 700;
  font-size:    1.4rem;
`

export const CategoryBody = styled.div<{ $twoColumns: boolean }>`
  padding: 4px 6px 4px;
  flex: 1;
  overflow: hidden;
  column-count: ${({ $twoColumns }) => ($twoColumns ? 2 : 1)};
  column-gap: 6px;
`

export const ItemRow = styled.div`
  break-inside: avoid;
  margin-bottom: 3px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) 50px 60px;
  gap: 3px;
  align-items: center;
`

export const ItemInput = styled.input`
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 2px 4px;
  font-size: 1.1rem;
  background: #f9fafb;
  outline: none;
  color: #111827;
  font-weight: 700;

  &:focus {
    border-color: #f97316;
    background: #ffffff;
  }
`

export const ItemQtyInput = styled(ItemInput)`
  width: 100%;
  max-width: 100%;
  text-align: right;
`

export const ItemUnit = styled.select`
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 2px 4px;
  font-size: 1.2rem;
  background: #f9fafb;
  outline: none;
  color: #111827;
  font-weight: 700;
  height: 100%;

  &:focus {
    border-color: #f97316;
    background: #ffffff;
  }
`

export const AddItemBar = styled.div`
  padding: 2px 6px 4px;
  display: flex;
  justify-content: flex-end;
`

export const AddItemButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f97316;
    color: #111827;
    border-color: #f97316;
  }
`

export const CommentsArea = styled.div`
  padding: 4px 6px 6px;
  border-top: 1px solid #e5e7eb;
`

export const CommentsLabel = styled.div`
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 2px;
  color: #111827;
  font-weight: 700;
`

export const CommentsTextarea = styled.textarea`
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 3px 4px;
  font-size: 0.9rem;
  background: #f9fafb;
  resize: none;
  outline: none;
  height: 28px;
  line-height: 1.2;
  color: #111827;
  font-weight: 700;

  &:focus {
    border-color: #f97316;
    background: #ffffff;
  }
`
