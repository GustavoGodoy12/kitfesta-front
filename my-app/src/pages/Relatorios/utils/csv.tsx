export function toCsv(rows: Array<Record<string, string | number>>): string {
  if (!rows.length) return ''
  const header = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const body = rows.map(r => header.map(k => escape(r[k])).join(','))
  return header.join(',') + '\n' + body.join('\n')
}
