
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from 'recharts'
import { COLORS } from '../utils/colors'

type Row = { name: string; value: number }
export default function PieTipo({ data }: { data: Row[] }) {
  const fills = [COLORS.secondary, COLORS.primary]
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie dataKey="value" nameKey="name" data={data} cx="50%" cy="50%" outerRadius={90} label>
          {data.map((_, i) => (<Cell key={i} fill={fills[i % fills.length]} />))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
