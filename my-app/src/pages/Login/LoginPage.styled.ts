import styled from 'styled-components'

export const LoginShell = styled.div`
  /* centraliza perfeito e remove qualquer scroll interno */
  min-height: 100dvh;
  width: 100%;
  display: grid;
  place-items: center;
  background: #ffffff;
  overflow: hidden;
  padding: 0;
`

export const Card = styled.div`
  width: min(94vw, 420px);
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: clamp(16px, 3.5vw, 28px);
  /* sombra SUPER sutil */
  box-shadow: 0 8px 28px rgba(0,0,0,0.04);

  @media (max-width: 420px) {
    width: 92vw;
    border-radius: 14px;
  }
`

export const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.01em;
`

export const Subtitle = styled.p`
  margin: 0 0 18px;
  color: #555;
  font-size: 14px;
`

export const Field = styled.label`
  display: block;
  margin: 12px 0;
  color: #111;
  font-size: 14px;

  input {
    width: 100%;
    margin-top: 6px;
    padding: 12px 14px;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
    outline: none;
    font-size: 14px;
    background: #fff;
    color: #111;
    transition: border-color .15s ease, box-shadow .15s ease;
  }
  input::placeholder { color: #999; }
  input:focus {
    border-color: #111;         /* preto discreto */
    box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
  }
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;

  button {
    appearance: none;
    border: 1px solid #111;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 600;
    cursor: pointer;
    background: #111;
    color: #fff;
    transition: transform .06s ease, box-shadow .15s ease, background .15s ease, color .15s ease;
  }
  button:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
  button:active { transform: translateY(0); box-shadow: none; }

  .btn-ghost {
    background: #fff;
    color: #111;
  }
`

export const ErrorBox = styled.div`
  color: #b91c1c;
  background: #fff;
  border: 1px solid #f3b4b4;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 8px;
  font-size: 13px;
`
