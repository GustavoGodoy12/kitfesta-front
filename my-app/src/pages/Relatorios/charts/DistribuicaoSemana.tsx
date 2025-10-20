
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { COLORS } from '../utils/colors'

type Row = { name: string; value: number }
export default function DistribuicaoSemana({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" name="Kits" fill={COLORS.primary} />
      </BarChart>
    </ResponsiveContainer>
  )
}
