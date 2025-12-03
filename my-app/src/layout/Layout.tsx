import type { ReactNode } from 'react'
import Sidebar from '../components/Sidebar/Sidebar' // ajusta o caminho se precisar
import { PageWrapper, Main, Content } from './Layout.styled'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PageWrapper>
      <Sidebar />

      <Main>
        <Content>
          {children}
        </Content>
      </Main>
    </PageWrapper>
  )
}
