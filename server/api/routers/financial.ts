/**
 * Financial Router for tRPC
 * 
 * This router handles all financial and accounting operations.
 * It provides endpoints for invoices, payments, expenses, and financial reporting.
 * 
 * Features:
 * - Invoice management (create, read, update, delete)
 * - Payment processing and tracking
 * - Expense management
 * - Account management
 * - Financial transactions
 * - Tax calculations
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  protectedProcedure,
  auditedProcedure,
  createPermissionProcedure
} from '../../../lib/trpc'

/**
 * Input validation schemas
 */
const invoiceSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().datetime('Invalid issue date'),
  dueDate: z.string().datetime('Invalid due date'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  taxAmount: z.number().min(0, 'Tax amount must be positive'),
  discountAmount: z.number().min(0, 'Discount amount must be positive').default(0),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid().optional(),
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().min(0, 'Quantity must be positive'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
    amount: z.number().min(0, 'Amount must be positive'),
  })),
})

const updateInvoiceSchema = invoiceSchema.partial().extend({
  id: z.string().uuid('Invalid invoice ID'),
})

const paymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  amount: z.number().min(0, 'Payment amount must be positive'),
  paymentDate: z.string().datetime('Invalid payment date'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'check', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

const expenseSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  vendorId: z.string().uuid().optional(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  expenseDate: z.string().datetime('Invalid expense date'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'check', 'other']),
  reference: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  taxAmount: z.number().min(0, 'Tax amount must be positive').default(0),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  notes: z.string().optional(),
})

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  code: z.string().min(1, 'Account code is required'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
})

/**
 * Permission-based procedures
 */
const financialReadProcedure = createPermissionProcedure('financial:read')
const financialWriteProcedure = createPermissionProcedure('financial:write')
const financialDeleteProcedure = createPermissionProcedure('financial:delete')

/**
 * Financial router
 */
export const financialRouter = createTRPCRouter({
  /**
   * Get all invoices with pagination and filtering
   */
  getInvoices: financialReadProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
      customerId: z.string().uuid().optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, status, customerId, dateFrom, dateTo } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('invoices')
          .select(`
            *,
            customers (id, name, email),
            invoice_items (*)
          `, { count: 'exact' })
          .eq('tenant_id', ctx.user.tenantId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        // Apply filters
        if (search) {
          query = query.or(`invoice_number.ilike.%${search}%,notes.ilike.%${search}%`)
        }
        
        if (status) {
          query = query.eq('status', status)
        }
        
        if (customerId) {
          query = query.eq('customer_id', customerId)
        }
        
        if (dateFrom) {
          query = query.gte('issue_date', dateFrom)
        }
        
        if (dateTo) {
          query = query.lte('issue_date', dateTo)
        }

        const { data: invoices, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch invoices',
            cause: error,
          })
        }

        return {
          invoices: invoices || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get invoices error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch invoices',
        })
      }
    }),

  /**
   * Get invoice by ID
   */
  getInvoice: financialReadProcedure
    .input(z.object({
      id: z.string().uuid('Invalid invoice ID'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { data: invoice, error } = await ctx.supabase
          .from('invoices')
          .select(`
            *,
            customers (id, name, email, address, phone),
            invoice_items (*),
            payments (*)
          `)
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        return invoice
      } catch (error) {
        console.error('Get invoice error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch invoice',
        })
      }
    }),

  /**
   * Create new invoice
   */
  createInvoice: auditedProcedure
    .use(financialWriteProcedure.middleware)
    .input(invoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { items, ...invoiceData } = input

        // Check if invoice number already exists
        const { data: existingInvoice } = await ctx.supabase
          .from('invoices')
          .select('id')
          .eq('invoice_number', input.invoiceNumber)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (existingInvoice) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Invoice with this number already exists',
          })
        }

        // Create invoice
        const { data: invoice, error: invoiceError } = await ctx.supabase
          .from('invoices')
          .insert({
            ...invoiceData,
            tenant_id: ctx.user.tenantId,
            created_by: ctx.user.userId,
            updated_by: ctx.user.userId,
          })
          .select()
          .single()

        if (invoiceError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create invoice',
            cause: invoiceError,
          })
        }

        // Create invoice items
        if (items.length > 0) {
          const { error: itemsError } = await ctx.supabase
            .from('invoice_items')
            .insert(
              items.map(item => ({
                ...item,
                invoice_id: invoice.id,
                tenant_id: ctx.user.tenantId,
              }))
            )

          if (itemsError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create invoice items',
              cause: itemsError,
            })
          }
        }

        return invoice
      } catch (error) {
        console.error('Create invoice error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invoice',
        })
      }
    }),

  /**
   * Update invoice
   */
  updateInvoice: auditedProcedure
    .use(financialWriteProcedure.middleware)
    .input(updateInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, items, ...updateData } = input

        // Check if invoice exists and belongs to tenant
        const { data: existingInvoice } = await ctx.supabase
          .from('invoices')
          .select('id, status')
          .eq('id', id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (!existingInvoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        // Prevent updating paid invoices
        if (existingInvoice.status === 'paid' && updateData.status !== 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot modify paid invoice',
          })
        }

        // Update invoice
        const { data: invoice, error: updateError } = await ctx.supabase
          .from('invoices')
          .update({
            ...updateData,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('tenant_id', ctx.user.tenantId)
          .select()
          .single()

        if (updateError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update invoice',
            cause: updateError,
          })
        }

        // Update invoice items if provided
        if (items) {
          // Delete existing items
          await ctx.supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id)
            .eq('tenant_id', ctx.user.tenantId)

          // Insert new items
          if (items.length > 0) {
            await ctx.supabase
              .from('invoice_items')
              .insert(
                items.map(item => ({
                  ...item,
                  invoice_id: id,
                  tenant_id: ctx.user.tenantId,
                }))
              )
          }
        }

        return invoice
      } catch (error) {
        console.error('Update invoice error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update invoice',
        })
      }
    }),

  /**
   * Delete invoice
   */
  deleteInvoice: auditedProcedure
    .use(financialDeleteProcedure.middleware)
    .input(z.object({
      id: z.string().uuid('Invalid invoice ID'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if invoice exists and can be deleted
        const { data: invoice } = await ctx.supabase
          .from('invoices')
          .select('id, status')
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        if (invoice.status === 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete paid invoice',
          })
        }

        // Soft delete by setting status to cancelled
        const { error } = await ctx.supabase
          .from('invoices')
          .update({
            status: 'cancelled',
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete invoice',
            cause: error,
          })
        }

        return { success: true, message: 'Invoice deleted successfully' }
      } catch (error) {
        console.error('Delete invoice error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete invoice',
        })
      }
    }),

  /**
   * Create payment
   */
  createPayment: auditedProcedure
    .use(financialWriteProcedure.middleware)
    .input(paymentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { invoiceId, amount, paymentDate, paymentMethod, reference, notes } = input

        // Get invoice details
        const { data: invoice } = await ctx.supabase
          .from('invoices')
          .select('id, total_amount, status')
          .eq('id', invoiceId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        if (invoice.status === 'cancelled') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot add payment to cancelled invoice',
          })
        }

        // Get total payments for this invoice
        const { data: existingPayments } = await ctx.supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', invoiceId)
          .eq('tenant_id', ctx.user.tenantId)

        const totalPaid = existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
        const remainingAmount = invoice.total_amount - totalPaid

        if (amount > remainingAmount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment amount exceeds remaining balance',
          })
        }

        // Create payment record
        const { data: payment, error: paymentError } = await ctx.supabase
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            tenant_id: ctx.user.tenantId,
            amount,
            payment_date: paymentDate,
            payment_method: paymentMethod,
            reference,
            notes,
            created_by: ctx.user.userId,
          })
          .select()
          .single()

        if (paymentError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create payment',
            cause: paymentError,
          })
        }

        // Update invoice status if fully paid
        const newTotalPaid = totalPaid + amount
        if (newTotalPaid >= invoice.total_amount) {
          await ctx.supabase
            .from('invoices')
            .update({
              status: 'paid',
              updated_by: ctx.user.userId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId)
            .eq('tenant_id', ctx.user.tenantId)
        }

        return payment
      } catch (error) {
        console.error('Create payment error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment',
        })
      }
    }),

  /**
   * Get expenses with pagination and filtering
   */
  getExpenses: financialReadProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      categoryId: z.string().uuid().optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, categoryId, dateFrom, dateTo } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('expenses')
          .select(`
            *,
            expense_categories (id, name),
            vendors (id, name)
          `, { count: 'exact' })
          .eq('tenant_id', ctx.user.tenantId)
          .order('expense_date', { ascending: false })
          .range(offset, offset + limit - 1)

        // Apply filters
        if (search) {
          query = query.or(`description.ilike.%${search}%,reference.ilike.%${search}%`)
        }
        
        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
        
        if (dateFrom) {
          query = query.gte('expense_date', dateFrom)
        }
        
        if (dateTo) {
          query = query.lte('expense_date', dateTo)
        }

        const { data: expenses, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch expenses',
            cause: error,
          })
        }

        return {
          expenses: expenses || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get expenses error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch expenses',
        })
      }
    }),

  /**
   * Create expense
   */
  createExpense: auditedProcedure
    .use(financialWriteProcedure.middleware)
    .input(expenseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { data: expense, error } = await ctx.supabase
          .from('expenses')
          .insert({
            ...input,
            tenant_id: ctx.user.tenantId,
            created_by: ctx.user.userId,
            updated_by: ctx.user.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create expense',
            cause: error,
          })
        }

        return expense
      } catch (error) {
        console.error('Create expense error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create expense',
        })
      }
    }),

  /**
   * Get financial summary
   */
  getFinancialSummary: financialReadProcedure
    .input(z.object({
      dateFrom: z.string().datetime(),
      dateTo: z.string().datetime(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { dateFrom, dateTo } = input

        // Get revenue (paid invoices)
        const { data: revenueData } = await ctx.supabase
          .from('invoices')
          .select('total_amount')
          .eq('tenant_id', ctx.user.tenantId)
          .eq('status', 'paid')
          .gte('issue_date', dateFrom)
          .lte('issue_date', dateTo)

        const totalRevenue = revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0

        // Get expenses
        const { data: expenseData } = await ctx.supabase
          .from('expenses')
          .select('amount')
          .eq('tenant_id', ctx.user.tenantId)
          .gte('expense_date', dateFrom)
          .lte('expense_date', dateTo)

        const totalExpenses = expenseData?.reduce((sum, exp) => sum + exp.amount, 0) || 0

        // Get outstanding invoices
        const { data: outstandingData } = await ctx.supabase
          .from('invoices')
          .select('total_amount')
          .eq('tenant_id', ctx.user.tenantId)
          .in('status', ['sent', 'overdue'])

        const totalOutstanding = outstandingData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0

        return {
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: totalRevenue - totalExpenses,
          outstanding: totalOutstanding,
        }
      } catch (error) {
        console.error('Get financial summary error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch financial summary',
        })
      }
    }),
})