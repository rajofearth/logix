function pad2(n: number): string {
  return n.toString().padStart(2, "0")
}

export function isoToDateTimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const min = pad2(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export function dateTimeLocalToIso(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid datetime")
  }
  return d.toISOString()
}


