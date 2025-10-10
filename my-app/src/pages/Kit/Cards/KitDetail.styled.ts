import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Back = styled(Link)`
  text-decoration: none;
  color: var(--orange);

  &:hover {
    color: var(--orange-600);
  }
`

export const Title = styled.h1`
  font-size: clamp(24px, 4vw, 36px);
  line-height: 1.2;
  margin: 8px 0 4px;
  color: var(--text);
`

export const Subtitle = styled.div`
  color: var(--muted);
  margin-bottom: 12px;
`

export const Card = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
`

export const HeaderGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`

export const Label = styled.label`
  font-size: 0.9rem;
  color: var(--muted);
`

export const Input = styled.input`
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  padding: 10px 12px;

  &:focus {
    outline: 3px solid var(--orange);
    outline-offset: 1px;
  }
`

export const GridTwo = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const ItemForm = styled.form`
  display: grid;
  gap: 8px;
  grid-template-columns: 1.2fr .5fr 1fr auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const ItemList = styled.ul`
  margin-top: 12px;
  padding: 0;
  list-style: none;
`

export const ItemRow = styled.li`
  display: grid;
  grid-template-columns: 1fr 120px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 6px;

    > div.actions {
      justify-content: flex-start;
    }
  }
`

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
`

export const SmallMuted = styled.small`
  color: var(--muted);
`

/* Bolo form */
export const BoloFormGrid = styled.form`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 100px 100px 1fr 1fr 1.2fr auto;
  margin-bottom: 8px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 100px 1fr 1fr auto;
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`
