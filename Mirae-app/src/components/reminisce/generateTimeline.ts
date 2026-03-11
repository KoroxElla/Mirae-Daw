export interface TimelineNode {
  id: number
  date: string
  emotion: string
  preview: string
  x: number
  y: number
}

export function generateTimeline(entries: any[]): TimelineNode[] {

  const spacingY = 120
  const amplitude = 150

  return entries.map((entry, index) => {

    const y = index * spacingY

    // zig-zag curve
    const x =
      Math.sin(index * 0.8) * amplitude

    return {
      id: entry.id,
      date: entry.date,
      emotion: entry.emotion,
      preview: entry.preview,
      x,
      y
    }
  })
}
