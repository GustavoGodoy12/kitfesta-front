import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { Actions, Card, ErrorBox, Field, LoginShell, Subtitle, Title } from './LoginPage.styled'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('gabriel@janine.com.br')
  const [password, setPassword] = useState('1911')
  const [err, setErr] = useState('')

  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const next = params.get('next') || '/'

  // remove o scroll da página enquanto o login estiver visível
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevHtmlOverflow = (document.documentElement as HTMLElement).style.overflow
    document.body.style.overflow = 'hidden'
    ;(document.documentElement as HTMLElement).style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      ;(document.documentElement as HTMLElement).style.overflow = prevHtmlOverflow
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3022'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Falha ao autenticar')
      }
      const data = await res.json()
      login(data.user) // salva user no contexto/localStorage
      navigate(next, { replace: true })
    } catch (e: any) {
      setErr(e?.message || 'Erro de login')
    }
  }

  return (
    <LoginShell>
      <Card>
        <form onSubmit={onSubmit} noValidate>
          <Title>Entrar</Title>
          <Subtitle>Faça login para acessar os relatórios</Subtitle>

          {err && <ErrorBox>{err}</ErrorBox>}

          <Field>
            Email
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="username"
              inputMode="email"
            />
          </Field>

          <Field>
            Senha
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </Field>

          <Actions>
            <button type="submit">Entrar</button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/')}>Cancelar</button>
          </Actions>
        </form>
      </Card>
    </LoginShell>
  )
}
