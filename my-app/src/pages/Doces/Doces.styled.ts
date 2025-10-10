import styled from 'styled-components'

export {
  Page,
  Title,
  Subtitle,
  TopBar,
  LeftGroup,
  RightGroup,
  DateInput,
  Button,
  GridCards,
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalGrid,
  Divider,
  Label,
} from '../Kit/Kits.styled'

// Se precisar usar texto “apagado” nesta página, reutilize do card:
export { Muted } from '../../components/KitCard/KitCard.styled'

/** Lista simples para exibir “sabor — quantidade” dentro do card */
export const SaborList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;

  li { color: var(--text); }
`
