"use client"

import { formatCurrency } from "@/lib/utils"
import { CategoryBreakdown } from "@/models/stats"
import { useState } from "react"

interface CategoryPieChartProps {
  categories: CategoryBreakdown[]
  total: number
  type: "income" | "expense"
  defaultCurrency: string
}

interface SliceData {
  category: CategoryBreakdown
  percentage: number
  startAngle: number
  endAngle: number
  amount: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const span = endAngle - startAngle
  if (span >= 359.99) {
    // Full circle - draw two half arcs
    const mid = startAngle + 180
    const s1 = polarToCartesian(cx, cy, r, startAngle)
    const m = polarToCartesian(cx, cy, r, mid)
    const e = polarToCartesian(cx, cy, r, startAngle + 359.99)
    return `M ${s1.x} ${s1.y} A ${r} ${r} 0 1 1 ${m.x} ${m.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`
  }
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArcFlag = span > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

export function CategoryPieChart({ categories, total, type, defaultCurrency }: CategoryPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (total === 0 || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No {type} data available
      </div>
    )
  }

  const sorted = [...categories]
    .map((cat) => ({
      category: cat,
      amount: type === "income" ? cat.income : cat.expenses,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const slices: SliceData[] = []
  let currentAngle = 0
  for (const { category, amount } of sorted) {
    const percentage = (amount / total) * 100
    const sliceAngle = (amount / total) * 360
    slices.push({
      category,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + sliceAngle,
      amount,
    })
    currentAngle += sliceAngle
  }

  const cx = 100
  const cy = 100
  const r = 80
  const isIncome = type === "income"
  const colorClass = isIncome ? "text-green-600" : "text-red-600"

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Pie */}
      <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-56 md:h-56">
        {slices.map((slice, i) => {
          const isHovered = hoveredIndex === i
          const scale = isHovered ? "scale(1.04)" : "scale(1)"
          return (
            <path
              key={slice.category.code}
              d={describeArc(cx, cy, r, slice.startAngle, slice.endAngle)}
              fill={slice.category.color}
              className="stroke-background"
              strokeWidth={2}
              opacity={hoveredIndex !== null && !isHovered ? 0.5 : 1}
              style={{
                transform: scale,
                transformOrigin: `${cx}px ${cy}px`,
                transition: "transform 0.2s ease, opacity 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          )
        })}
        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
          Total
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className={`text-[11px] font-bold ${isIncome ? "fill-green-600" : "fill-red-600"}`}>
          {formatCurrency(total, defaultCurrency)}
        </text>
      </svg>

      {/* Legend */}
      <div className="w-full space-y-1.5 max-h-48 overflow-y-auto">
        {slices.map((slice, i) => (
          <div
            key={slice.category.code}
            className={`flex items-center justify-between gap-2 px-2 py-1 rounded transition-colors duration-150 ${
              hoveredIndex === i ? "bg-muted" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.category.color }} />
              <span className="text-xs text-foreground truncate">{slice.category.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-medium ${colorClass}`}>
                {formatCurrency(slice.amount, defaultCurrency)}
              </span>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
