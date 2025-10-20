import React from 'react'
import { COLORS } from '../utils/colors'

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border:`1px solid ${COLORS.primary}`, borderRadius:12, padding:12, background:'#fff' }}>
      <div style={{ fontWeight:700, color:COLORS.secondary, marginBottom:8 }}>{title}</div>
      {children}
    </div>
  )
}
