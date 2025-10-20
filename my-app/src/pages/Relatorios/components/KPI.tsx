import React from 'react'
import { COLORS } from '../utils/colors'

export function KPI({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding:12, border:`1px solid ${COLORS.primary}`, borderRadius:12, background:COLORS.light }}>
      <div style={{ color:COLORS.secondary, fontSize:12, fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:COLORS.primary }}>{value}</div>
    </div>
  )
}
