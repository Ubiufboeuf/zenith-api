import { createCursor, cursorFromB64, cursorToB64 } from '@/services/cursorService'
import { getProductBy, getProductsByCursor } from '@/services/productsService'
import { failiure, success } from '@/utils/response'
import type { Request, Response } from 'express'

type GetProductsRequest = Request<null, null, null, {
  code?: string
  limit?: string
  cursor?: string
}>

export async function getProducts (req: GetProductsRequest, res: Response) {
  const { query } = req

  const code = query.code
  if (code) {
    const product = await getProductBy('code', code)
    if (product) {
      return success(res, { product })
    }

    return failiure(res, 'No se encontró el producto', { status: 404 })
  }

  const { limit: ql = 1, cursor: qc } = query
  const limit = Number(ql)
  const cursorStr = !qc || qc === 'undefined' || qc === 'null'
    ? undefined
    : qc

  const cursor = cursorStr
    ? cursorFromB64(JSON.stringify(cursorStr))
    : createCursor()

  if (!cursor) {
    return failiure(res, 'No se pudo crear un nuevo cursor', { status: 500 })
  }

  const { list: products, nextCursor } = await getProductsByCursor(cursor, limit)

  if (!products.length) {
    return failiure(res, 'No se encontraron los productos solicitados', { status: 404 })
  }

  success(res, {
    products,
    nextCursor: nextCursor ? cursorToB64(nextCursor) : null
  })
}
