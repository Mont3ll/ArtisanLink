'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  description: string | null
  phoneNumber: string | null
  mpesaReceiptNumber: string | null
  failureReason: string | null
  createdAt: string
  paidAt: string | null
}

export interface PaymentSummary {
  totalPayments: number
  totalAmount: number
  completedPayments: number
  completedAmount: number
  pendingPayments: number
  failedPayments: number
}

export interface PaymentsResponse {
  items: Payment[]
  summary: PaymentSummary
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaymentFilters {
  page?: number
  limit?: number
  status?: string
}

export interface ReceiptData {
  receiptNumber: string
  paymentId: string
  transactionDate: string
  customer: {
    name: string
    email: string
    phone: string | null
  }
  payment: {
    amount: number
    currency: string
    method: string
    status: string
    description: string | null
    mpesaReceiptNumber: string | null
    failureReason: string | null
  }
  subscription: {
    id: string
    plan: string
    status: string
    startDate: string
    endDate: string
  }
  company: {
    name: string
    address: string
    email: string
    phone: string
  }
  createdAt: string
  paidAt: string | null
}

// Query keys
export const artisanPaymentsKeys = {
  all: ['artisan-payments'] as const,
  lists: () => [...artisanPaymentsKeys.all, 'list'] as const,
  list: (filters: PaymentFilters) => [...artisanPaymentsKeys.lists(), filters] as const,
  receipt: (id: string) => [...artisanPaymentsKeys.all, 'receipt', id] as const,
}

// Fetch functions
async function fetchPayments(filters: PaymentFilters): Promise<PaymentsResponse> {
  const params = new URLSearchParams({
    page: (filters.page || 1).toString(),
    limit: (filters.limit || 10).toString(),
  })
  
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status)
  }
  
  const response = await fetch(`/api/artisan/payments?${params}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments')
  }
  
  return response.json()
}

async function fetchReceipt(paymentId: string): Promise<ReceiptData> {
  const response = await fetch(`/api/artisan/payments/${paymentId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch receipt')
  }
  
  return response.json()
}

async function exportPayments(status?: string): Promise<Blob> {
  const params = new URLSearchParams()
  if (status && status !== 'all') {
    params.set('status', status)
  }
  
  const response = await fetch(`/api/artisan/payments/export?${params}`)
  
  if (!response.ok) {
    throw new Error('Failed to export payments')
  }
  
  return response.blob()
}

/**
 * Hook for fetching artisan payments with pagination and filtering
 */
export function useArtisanPayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: artisanPaymentsKeys.list(filters),
    queryFn: () => fetchPayments(filters),
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook for fetching a single payment receipt
 */
export function usePaymentReceipt(paymentId: string | null) {
  return useQuery({
    queryKey: artisanPaymentsKeys.receipt(paymentId || ''),
    queryFn: () => fetchReceipt(paymentId!),
    enabled: !!paymentId,
  })
}

/**
 * Hook for exporting payments to CSV
 */
export function useExportPayments() {
  return useMutation({
    mutationFn: (status?: string) => exportPayments(status),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}

// Status configuration
export const PAYMENT_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
} as const

// Utility functions
export function formatPaymentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPaymentDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateReceiptContent(receiptData: ReceiptData): string {
  return `
ArtisanLink Kenya - Payment Receipt
=====================================

Receipt Number: ${receiptData.receiptNumber}
Transaction Date: ${formatPaymentDate(receiptData.transactionDate)}

Customer Details
----------------
Name: ${receiptData.customer.name}
Email: ${receiptData.customer.email}
Phone: ${receiptData.customer.phone || 'N/A'}

Payment Details
---------------
Amount: ${receiptData.payment.currency} ${receiptData.payment.amount.toLocaleString()}
Method: ${receiptData.payment.method}
Status: ${receiptData.payment.status}
Description: ${receiptData.payment.description || 'Subscription Payment'}
M-Pesa Receipt: ${receiptData.payment.mpesaReceiptNumber || 'N/A'}

Subscription Details
--------------------
Plan: ${receiptData.subscription.plan}
Status: ${receiptData.subscription.status}
Valid From: ${formatPaymentDate(receiptData.subscription.startDate)}
Valid Until: ${formatPaymentDate(receiptData.subscription.endDate)}

=====================================
${receiptData.company.name}
${receiptData.company.address}
Email: ${receiptData.company.email}
Phone: ${receiptData.company.phone}
=====================================
  `.trim()
}

export function downloadReceipt(receiptData: ReceiptData): void {
  const content = generateReceiptContent(receiptData)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${receiptData.receiptNumber}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
