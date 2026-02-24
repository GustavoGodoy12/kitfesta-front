import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #111827;
  margin: 0;
`

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`

export const ModalField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

export const ModalLabel = styled.label`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
`

export const ModalInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  background: #f9fafb;
  outline: none;

  &:focus {
    border-color: #f97316;
    background: #fff;
  }
`

export const ModalSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  background: #f9fafb;
  outline: none;
  appearance: none;

  &:focus {
    border-color: #f97316;
    background: #fff;
  }
`

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`

export const CancelButton = styled.button`
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  color: #111827;

  &:hover { background: #e5e7eb; }
`

export const SaveButton = styled.button`
  padding: 8px 20px;
  border-radius: 999px;
  border: none;
  background: #f97316;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  color: #111827;

  &:hover { background: #ea580c; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`