
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { COLORS } from '../utils/colors'

type Row = { name: string; value: number }
export default function RankingSabores({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={140} />
        <Tooltip />
        <Bar dataKey="value" name="Quantidade" fill={COLORS.primary} />
      </BarChart>
    </ResponsiveContainer>
  )
}
