import styled, { keyframes } from 'styled-components'

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

export const ToastOverlay = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  z-index: 9999;
`

export const ToastContainer = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 380px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  box-shadow: 0 10px 25px rgba(22, 163, 74, 0.25);
  font-family: inherit;
  animation: ${fadeInUp} 0.25s ease-out;
  cursor: pointer;
`

export const ToastIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #16a34a;
  color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
`

export const ToastTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #14532d;
  margin-bottom: 2px;
`

export const ToastMessage = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #166534;
`
