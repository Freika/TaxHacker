import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryStatsData } from "@/models/stats"
import { ArrowDown, ArrowUp } from "lucide-react"
import { CategoryPieChart } from "./category-pie-chart"

interface CategoryPieChartsProps {
  categoryStats: CategoryStatsData
  defaultCurrency: string
}

export function CategoryPieCharts({ categoryStats, defaultCurrency }: CategoryPieChartsProps) {
  const { categories, totalIncome, totalExpenses } = categoryStats

  if (totalIncome === 0 && totalExpenses === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 border-green-200/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income by Category</CardTitle>
          <ArrowUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <CategoryPieChart
            categories={categories}
            total={totalIncome}
            type="income"
            defaultCurrency={defaultCurrency}
          />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white via-red-50/20 to-rose-50/30 border-red-200/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses by Category</CardTitle>
          <ArrowDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <CategoryPieChart
            categories={categories}
            total={totalExpenses}
            type="expense"
            defaultCurrency={defaultCurrency}
          />
        </CardContent>
      </Card>
    </div>
  )
}
