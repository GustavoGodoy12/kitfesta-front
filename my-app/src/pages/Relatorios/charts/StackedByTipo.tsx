
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'
import { COLORS } from '../utils/colors'

type Row = { date: string; retirada: number; entrega: number }
export default function StackedByTipo({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.ceil(Math.max(1, data.length / 10))} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="retirada" stackId="a" name="Retirada" fill={COLORS.secondary} />
        <Bar dataKey="entrega" stackId="a" name="Entrega" fill={COLORS.primary} />
      </BarChart>
    </ResponsiveContainer>
  )
}
