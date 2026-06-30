import { createCursor, cursorFromB64, cursorToB64 } from '@/services/cursorService'
import { getProductById, getProductsByCode, getProductsByCursor, getProductsSince } from '@/services/productsService'
import { failure, success } from '@/utils/response'
import { validateTimestamp } from '@/validations/timeValidations'
import type { Request, Response } from 'express'

type GetProductsRequest = Request<null, null, null, {
  code?: string
  since?: string
  limit?: string
  cursor?: string
}>

export async function getProducts (req: GetProductsRequest, res: Response) {
  const { query } = req

  // - Query Params -

  // ?code=[code]
  const code = query.code
  if (code) {
    const products = await getProductsByCode(code)
    if (products) {
      return success(res, { products })
    }

    return failure(res, 'No se encontró el producto', { status: 404 })
  }

  // ?since=[timesamp]
  const since = query.since
  if (since) {
    const validation = validateTimestamp(since)
    if (!validation.success) {
      return failure(res, 'La fecha indicada no es válida', { status: 400 })
    }

    const products = await getProductsSince(since)
    if (products) {
      return success(res, { products })
    }
    
    return failure(res, 'No se pudieron conseguir los productos desde esa fecha hasta ahora', { status: 500 })
  }

  // - Products -
  
  const { limit: ql = 1, cursor: qc } = query
  const limit = Number(ql)
  if (typeof limit !== 'number' || Number.isNaN(limit) || !Number.isFinite(limit) || !Number.isInteger(limit) || limit <= 0) {
    return failure(res, 'El límite especificado es inválido', { status: 400 })
  }
  
  const cursorStr = !qc || qc === 'undefined' || qc === 'null'
    ? undefined
    : qc

  const cursor = cursorStr
    ? cursorFromB64(cursorStr)
    : createCursor()

  if (!cursor) {
    return failure(res, 'No se pudo crear un nuevo cursor', { status: 500 })
  }

  const { list: products, nextCursor } = await getProductsByCursor(cursor, limit)

  success(res, {
    products,
    nextCursor: nextCursor ? cursorToB64(nextCursor) : null
  })
}

export async function getProduct (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getProductById(id)
  if (!product) {
    return failure(res, 'No se encontró el producto', { status: 404 })
  }
  
  success(res, { product })
}
