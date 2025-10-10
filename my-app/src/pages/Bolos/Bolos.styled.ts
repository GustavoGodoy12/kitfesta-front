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

export { Muted } from '../../components/KitCard/KitCard.styled'

/** Lista para exibir “sabor — quantidade — (texto opcional)” dentro do card */
export const SaborList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;

  li { color: var(--text); }
  em { color: var(--muted); font-style: normal; }
`
