
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { COLORS } from '../utils/colors'

type Row = { name: string; value: number }
export default function ItensCategoria({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" name="Quantidade" barSize={42} fill={COLORS.primary} />
      </BarChart>
    </ResponsiveContainer>
  )
}
