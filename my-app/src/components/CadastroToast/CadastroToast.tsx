import { useEffect } from 'react'
import {
  ToastOverlay,
  ToastContainer,
  ToastIcon,
  ToastTitle,
  ToastMessage,
} from './CadastroToast.styled'

type CadastroToastProps = {
  /** se o popup está visível */
  open: boolean
  /** id do pedido cadastrado (ex: 123) */
  pedidoId?: string | number
  /** nome do cliente (opcional – só pra deixar mais amigável) */
  cliente?: string
  /** callback quando some (auto ou clique) */
  onClose?: () => void
  /** tempo em ms para sumir automático (default 2500) */
  autoCloseMs?: number
}

export default function CadastroToast({
  open,
  pedidoId,
  cliente,
  onClose,
  autoCloseMs = 2500,
}: CadastroToastProps) {
  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      onClose?.()
    }, autoCloseMs)

    return () => window.clearTimeout(timer)
  }, [open, autoCloseMs, onClose])

  if (!open) return null

  const hasCliente = cliente && cliente.trim().length > 0

  return (
    <ToastOverlay aria-live="polite" aria-atomic="true">
      <ToastContainer onClick={onClose}>
        <ToastIcon>✓</ToastIcon>
        <div>
          <ToastTitle>Pedido cadastrado!</ToastTitle>
          <ToastMessage>
            {pedidoId ? `Pedido ${pedidoId} salvo com sucesso.` : 'Cadastro salvo com sucesso.'}
            {hasCliente && ` Cliente: ${cliente}.`}
          </ToastMessage>
        </div>
      </ToastContainer>
    </ToastOverlay>
  )
}
