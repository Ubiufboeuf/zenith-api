import { getProductFieldIssues } from '@/errors/productErrors'
import { CreateProductSchema, ProductFullSchema, ProductSchema, StrictCreateProductSchema } from '@/schemas/productsSchemas'
import type { CreateProduct, Product, ProductFull, StrictCreateProduct } from '@/types/productsTypes'
import type { Validation } from '@/types/validationTypes'
import z from 'zod'

export function isValidProduct (data: unknown): data is Product {
  return z.safeParse(ProductSchema, data).success
}

export function isValidProductFull (data: unknown): data is ProductFull {
  return z.safeParse(ProductFullSchema, data).success
}

export function validateProductCreation (data: unknown): Validation<CreateProduct> {
  const validation = CreateProductSchema.safeParse(data)

  if (!validation.success) {
    const inputFields = validation.data
    let fieldIssues = getProductFieldIssues({ error: validation.error, joinPattern: '\n\t', inputFields })

    if (fieldIssues.fields.every((f) => f.value === '"unknown"') && data && typeof data === 'object' && 'codes' in data) {
      fieldIssues = getProductFieldIssues({ error: validation.error, joinPattern: '\n\t', inputFields: data.codes })
    }
    
    const userFriendlyErrorMessage = `Campos inválidos\nSe esperaba:\n\t${fieldIssues.expected}\nen vez de:\n\t${fieldIssues.received}`
    const errorMessage = userFriendlyErrorMessage
    const status = 400

    return {
      success: false,
      error: errorMessage,
      userFriendlyError: userFriendlyErrorMessage,
      status
    }
  }

  return {
    success: true,
    data: validation.data
  }
}

export function validateStrictProductCreation (data: unknown): Validation<StrictCreateProduct> {
  const validation = StrictCreateProductSchema.safeParse(data)
  
  if (!validation.success) {
    const inputFields = data
    const fieldIssues = getProductFieldIssues({ error: validation.error, joinPattern: '\n\t', inputFields })
    
    const userFriendlyErrorMessage = `Campos inválidos\nSe esperaba:\n\t${fieldIssues.expected}\nen vez de:\n\t${fieldIssues.received}`
    const errorMessage = userFriendlyErrorMessage
    const status = 400

    return {
      success: false,
      error: errorMessage,
      userFriendlyError: userFriendlyErrorMessage,
      status
    }
  }

  return {
    success: true,
    data: validation.data
  }
}
