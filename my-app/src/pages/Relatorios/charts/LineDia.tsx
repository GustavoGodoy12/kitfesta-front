
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts'
import { COLORS } from '../utils/colors'

type Row = { date: string; total: number; acumulado: number }
type Props = { data: Row[]; showCumulative?: boolean }

export default function LineDia({ data, showCumulative }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.ceil(Math.max(1, data.length / 10))} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total" name="Total" dot={false} strokeWidth={2} stroke={COLORS.primary} />
        {showCumulative && (
          <Line type="monotone" dataKey="acumulado" name="Acumulado" dot={false} strokeWidth={2} stroke={COLORS.secondary} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
