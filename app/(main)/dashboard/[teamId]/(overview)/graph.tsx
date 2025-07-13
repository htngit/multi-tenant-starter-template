"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface GraphProps {
  className?: string;
}

export function Graph({ className }: GraphProps) {
  const params = useParams()
  const teamId = params.teamId as string

  // Fetch real inventory data from backend
  const { data: inventoryData, isLoading, error } = api.inventory.getMonthlyInventoryValue.useQuery(
    { teamId },
    {
      enabled: !!teamId,
      refetchInterval: 30000, // Refetch every 30 seconds for live data
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  )

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-[350px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load inventory data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const chartData = inventoryData || []

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
          <Bar
            dataKey="totalValue"
            name="Inventory Value"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
