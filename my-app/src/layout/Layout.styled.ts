import styled from 'styled-components'

export const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f5f5f7; /* fundo cinza geral */
`

export const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;

  /* menos espaço em cima pra caber tudo na tela */
  padding-top: calc(64px + 20px);
  padding-left: 10px;
  
  padding-bottom: 10px;
`

/* “Miolo” das páginas: tudo centralizado e com largura máxima */
export const Content = styled.div`
  max-width: 98%;  /* ajusta se quiser mais largo/estreito */
  margin: 0 auto;     /* centraliza */
`
