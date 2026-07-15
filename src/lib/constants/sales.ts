export const SALE_STATUS = ['COMPLETED', 'PENDING', 'CANCELLED'] as const
export const SALE_PAYMENT_STATUS = ['PAID', 'UNPAID', 'PARTIALLY_PAID'] as const
export const SALE_DOCUMENT_TYPE = ['RECEIPT', 'INVOICE'] as const
export const SALE_TYPE = ['IMMEDIATE', 'CREDIT'] as const
export const DEFAULT_IVA_RATE = 22
export const SALE_INCLUDE = {
  payments: false,
  details: false
}
