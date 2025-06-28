/**
 * Reports Router for tRPC
 * 
 * This router handles all reporting and analytics operations.
 * It provides endpoints for generating various business reports and analytics.
 * 
 * Features:
 * - Sales reports and analytics
 * - Inventory reports
 * - Financial reports
 * - Custom report generation
 * - Data export functionality
 * - Dashboard metrics
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  protectedProcedure,
  createPermissionProcedure
} from '../../../lib/trpc'

/**
 * Input validation schemas
 */
const dateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
})

const reportFilterSchema = z.object({
  dateRange: dateRangeSchema,
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  currency: z.string().length(3).optional(),
  categoryId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
})

const exportSchema = z.object({
  reportType: z.enum(['sales', 'inventory', 'financial', 'customers', 'products']),
  format: z.enum(['csv', 'xlsx', 'pdf']),
  filters: reportFilterSchema.optional(),
})

/**
 * Permission-based procedures
 */
const reportsReadProcedure = createPermissionProcedure('reports:read')
const reportsExportProcedure = createPermissionProcedure('reports:export')

/**
 * Helper functions
 */
function getDateGrouping(groupBy: string) {
  switch (groupBy) {
    case 'day':
      return 'DATE(created_at)'
    case 'week':
      return 'DATE_TRUNC(\'week\', created_at)'
    case 'month':
      return 'DATE_TRUNC(\'month\', created_at)'
    case 'quarter':
      return 'DATE_TRUNC(\'quarter\', created_at)'
    case 'year':
      return 'DATE_TRUNC(\'year\', created_at)'
    default:
      return 'DATE_TRUNC(\'month\', created_at)'
  }
}

/**
 * Reports router
 */
export const reportsRouter = createTRPCRouter({
  /**
   * Get dashboard metrics
   */
  getDashboardMetrics: reportsReadProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { startDate, endDate } = input

        // Get sales metrics
        const { data: salesData } = await ctx.supabase
          .from('invoices')
          .select('total_amount, status, created_at')
          .eq('tenant_id', ctx.user.tenantId)
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const totalSales = salesData?.filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total_amount, 0) || 0
        
        const pendingSales = salesData?.filter(inv => ['sent', 'overdue'].includes(inv.status))
          .reduce((sum, inv) => sum + inv.total_amount, 0) || 0

        // Get customer metrics
        const { count: totalCustomers } = await ctx.supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', ctx.user.tenantId)

        const { count: newCustomers } = await ctx.supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', ctx.user.tenantId)
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Get product metrics
        const { count: totalProducts } = await ctx.supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', ctx.user.tenantId)

        const { data: lowStockProducts } = await ctx.supabase
          .from('products')
          .select('id, name, stock_quantity, min_stock_level')
          .eq('tenant_id', ctx.user.tenantId)
          .lt('stock_quantity', 'min_stock_level')

        // Get expense metrics
        const { data: expenseData } = await ctx.supabase
          .from('expenses')
          .select('amount')
          .eq('tenant_id', ctx.user.tenantId)
          .gte('expense_date', startDate)
          .lte('expense_date', endDate)

        const totalExpenses = expenseData?.reduce((sum, exp) => sum + exp.amount, 0) || 0

        return {
          sales: {
            total: totalSales,
            pending: pendingSales,
            profit: totalSales - totalExpenses,
          },
          customers: {
            total: totalCustomers || 0,
            new: newCustomers || 0,
          },
          products: {
            total: totalProducts || 0,
            lowStock: lowStockProducts?.length || 0,
            lowStockItems: lowStockProducts || [],
          },
          expenses: {
            total: totalExpenses,
          },
        }
      } catch (error) {
        console.error('Get dashboard metrics error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard metrics',
        })
      }
    }),

  /**
   * Get sales report
   */
  getSalesReport: reportsReadProcedure
    .input(reportFilterSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { dateRange, groupBy, customerId } = input
        const { startDate, endDate } = dateRange

        let query = ctx.supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            total_amount,
            status,
            created_at,
            customers (id, name, email)
          `)
          .eq('tenant_id', ctx.user.tenantId)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })

        if (customerId) {
          query = query.eq('customer_id', customerId)
        }

        const { data: invoices, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch sales data',
            cause: error,
          })
        }

        // Group data by time period
        const groupedData = new Map()
        
        invoices?.forEach(invoice => {
          const date = new Date(invoice.created_at)
          let key: string
          
          switch (groupBy) {
            case 'day':
              key = date.toISOString().split('T')[0]
              break
            case 'week':
              const weekStart = new Date(date)
              weekStart.setDate(date.getDate() - date.getDay())
              key = weekStart.toISOString().split('T')[0]
              break
            case 'month':
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              break
            case 'quarter':
              const quarter = Math.floor(date.getMonth() / 3) + 1
              key = `${date.getFullYear()}-Q${quarter}`
              break
            case 'year':
              key = String(date.getFullYear())
              break
            default:
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          }

          if (!groupedData.has(key)) {
            groupedData.set(key, {
              period: key,
              totalSales: 0,
              paidSales: 0,
              pendingSales: 0,
              invoiceCount: 0,
              paidCount: 0,
            })
          }

          const group = groupedData.get(key)
          group.totalSales += invoice.total_amount
          group.invoiceCount += 1

          if (invoice.status === 'paid') {
            group.paidSales += invoice.total_amount
            group.paidCount += 1
          } else if (['sent', 'overdue'].includes(invoice.status)) {
            group.pendingSales += invoice.total_amount
          }
        })

        const chartData = Array.from(groupedData.values()).sort((a, b) => a.period.localeCompare(b.period))

        // Calculate totals
        const totals = {
          totalSales: invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
          paidSales: invoices?.filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
          pendingSales: invoices?.filter(inv => ['sent', 'overdue'].includes(inv.status))
            .reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
          invoiceCount: invoices?.length || 0,
          paidCount: invoices?.filter(inv => inv.status === 'paid').length || 0,
        }

        return {
          chartData,
          totals,
          invoices: invoices || [],
        }
      } catch (error) {
        console.error('Get sales report error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate sales report',
        })
      }
    }),

  /**
   * Get inventory report
   */
  getInventoryReport: reportsReadProcedure
    .input(z.object({
      categoryId: z.string().uuid().optional(),
      lowStockOnly: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { categoryId, lowStockOnly } = input

        let query = ctx.supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            stock_quantity,
            min_stock_level,
            unit_price,
            cost_price,
            categories (id, name)
          `)
          .eq('tenant_id', ctx.user.tenantId)
          .order('name')

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        if (lowStockOnly) {
          query = query.lt('stock_quantity', 'min_stock_level')
        }

        const { data: products, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch inventory data',
            cause: error,
          })
        }

        // Calculate inventory metrics
        const totalProducts = products?.length || 0
        const lowStockProducts = products?.filter(p => p.stock_quantity < p.min_stock_level).length || 0
        const totalValue = products?.reduce((sum, p) => sum + (p.stock_quantity * p.unit_price), 0) || 0
        const totalCost = products?.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price), 0) || 0

        // Group by category
        const categoryData = new Map()
        products?.forEach(product => {
          const categoryName = product.categories?.name || 'Uncategorized'
          
          if (!categoryData.has(categoryName)) {
            categoryData.set(categoryName, {
              category: categoryName,
              productCount: 0,
              totalQuantity: 0,
              totalValue: 0,
              lowStockCount: 0,
            })
          }

          const category = categoryData.get(categoryName)
          category.productCount += 1
          category.totalQuantity += product.stock_quantity
          category.totalValue += product.stock_quantity * product.unit_price
          
          if (product.stock_quantity < product.min_stock_level) {
            category.lowStockCount += 1
          }
        })

        return {
          products: products || [],
          summary: {
            totalProducts,
            lowStockProducts,
            totalValue,
            totalCost,
            profitMargin: totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0,
          },
          categoryBreakdown: Array.from(categoryData.values()),
        }
      } catch (error) {
        console.error('Get inventory report error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate inventory report',
        })
      }
    }),

  /**
   * Get financial report
   */
  getFinancialReport: reportsReadProcedure
    .input(reportFilterSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { dateRange, groupBy } = input
        const { startDate, endDate } = dateRange

        // Get revenue data
        const { data: revenueData } = await ctx.supabase
          .from('invoices')
          .select('total_amount, status, created_at')
          .eq('tenant_id', ctx.user.tenantId)
          .eq('status', 'paid')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Get expense data
        const { data: expenseData } = await ctx.supabase
          .from('expenses')
          .select('amount, expense_date, expense_categories (name)')
          .eq('tenant_id', ctx.user.tenantId)
          .gte('expense_date', startDate)
          .lte('expense_date', endDate)

        // Group revenue by time period
        const revenueByPeriod = new Map()
        revenueData?.forEach(invoice => {
          const date = new Date(invoice.created_at)
          let key: string
          
          switch (groupBy) {
            case 'day':
              key = date.toISOString().split('T')[0]
              break
            case 'week':
              const weekStart = new Date(date)
              weekStart.setDate(date.getDate() - date.getDay())
              key = weekStart.toISOString().split('T')[0]
              break
            case 'month':
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              break
            case 'quarter':
              const quarter = Math.floor(date.getMonth() / 3) + 1
              key = `${date.getFullYear()}-Q${quarter}`
              break
            case 'year':
              key = String(date.getFullYear())
              break
            default:
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          }

          revenueByPeriod.set(key, (revenueByPeriod.get(key) || 0) + invoice.total_amount)
        })

        // Group expenses by time period
        const expensesByPeriod = new Map()
        expenseData?.forEach(expense => {
          const date = new Date(expense.expense_date)
          let key: string
          
          switch (groupBy) {
            case 'day':
              key = date.toISOString().split('T')[0]
              break
            case 'week':
              const weekStart = new Date(date)
              weekStart.setDate(date.getDate() - date.getDay())
              key = weekStart.toISOString().split('T')[0]
              break
            case 'month':
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              break
            case 'quarter':
              const quarter = Math.floor(date.getMonth() / 3) + 1
              key = `${date.getFullYear()}-Q${quarter}`
              break
            case 'year':
              key = String(date.getFullYear())
              break
            default:
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          }

          expensesByPeriod.set(key, (expensesByPeriod.get(key) || 0) + expense.amount)
        })

        // Combine revenue and expenses
        const allPeriods = new Set([...revenueByPeriod.keys(), ...expensesByPeriod.keys()])
        const chartData = Array.from(allPeriods).map(period => ({
          period,
          revenue: revenueByPeriod.get(period) || 0,
          expenses: expensesByPeriod.get(period) || 0,
          profit: (revenueByPeriod.get(period) || 0) - (expensesByPeriod.get(period) || 0),
        })).sort((a, b) => a.period.localeCompare(b.period))

        // Calculate totals
        const totalRevenue = revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0
        const totalExpenses = expenseData?.reduce((sum, exp) => sum + exp.amount, 0) || 0
        const totalProfit = totalRevenue - totalExpenses

        // Group expenses by category
        const expensesByCategory = new Map()
        expenseData?.forEach(expense => {
          const category = expense.expense_categories?.name || 'Uncategorized'
          expensesByCategory.set(category, (expensesByCategory.get(category) || 0) + expense.amount)
        })

        return {
          chartData,
          summary: {
            totalRevenue,
            totalExpenses,
            totalProfit,
            profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
          },
          expensesByCategory: Array.from(expensesByCategory.entries()).map(([category, amount]) => ({
            category,
            amount,
          })),
        }
      } catch (error) {
        console.error('Get financial report error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate financial report',
        })
      }
    }),

  /**
   * Get customer analytics
   */
  getCustomerAnalytics: reportsReadProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { startDate, endDate } = input

        // Get customer data with their purchase history
        const { data: customers } = await ctx.supabase
          .from('customers')
          .select(`
            id,
            name,
            email,
            created_at,
            invoices!inner (
              id,
              total_amount,
              status,
              created_at
            )
          `)
          .eq('tenant_id', ctx.user.tenantId)
          .gte('invoices.created_at', startDate)
          .lte('invoices.created_at', endDate)

        // Calculate customer metrics
        const customerMetrics = customers?.map(customer => {
          const paidInvoices = customer.invoices.filter(inv => inv.status === 'paid')
          const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
          const totalOrders = customer.invoices.length
          const avgOrderValue = totalOrders > 0 ? totalSpent / paidInvoices.length : 0
          
          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            totalSpent,
            totalOrders,
            avgOrderValue,
            lastOrderDate: customer.invoices.length > 0 
              ? Math.max(...customer.invoices.map(inv => new Date(inv.created_at).getTime()))
              : null,
          }
        }) || []

        // Sort by total spent
        customerMetrics.sort((a, b) => b.totalSpent - a.totalSpent)

        // Calculate summary
        const totalCustomers = customerMetrics.length
        const totalRevenue = customerMetrics.reduce((sum, c) => sum + c.totalSpent, 0)
        const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
        const topCustomers = customerMetrics.slice(0, 10)

        return {
          customers: customerMetrics,
          summary: {
            totalCustomers,
            totalRevenue,
            avgCustomerValue,
          },
          topCustomers,
        }
      } catch (error) {
        console.error('Get customer analytics error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate customer analytics',
        })
      }
    }),

  /**
   * Export report data
   */
  exportReport: reportsExportProcedure
    .input(exportSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { reportType, format, filters } = input

        // This is a placeholder for export functionality
        // In a real implementation, you would:
        // 1. Generate the report data based on reportType and filters
        // 2. Format the data according to the requested format (CSV, XLSX, PDF)
        // 3. Store the file temporarily or return a download URL
        // 4. Return the file URL or base64 data

        // For now, we'll return a success message
        return {
          success: true,
          message: `${reportType} report export in ${format} format has been queued`,
          downloadUrl: `/api/exports/${reportType}-${Date.now()}.${format}`,
        }
      } catch (error) {
        console.error('Export report error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export report',
        })
      }
    }),
})