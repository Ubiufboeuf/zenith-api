import { createCursor, cursorFromB64, cursorToB64 } from '@/services/cursorService'
import { getProductById, getProductsByCursor } from '@/services/productsService'
import { response } from '@/utils/response'
import type { Request, Response } from 'express'

export async function getProducts (req: Request, res: Response) {
  const { query } = req
  const limit = Number(query.limit ?? 1)
  let cursorStr = query.cursor

  if (cursorStr === 'undefined' || cursorStr === 'null') {
    cursorStr = undefined
  }

  const cursor = cursorStr
    ? cursorFromB64(JSON.stringify(cursorStr))
    : createCursor()

  if (!cursor) {
    return res.status(500).end()
  }
  
  const { list: products, nextCursor } = await getProductsByCursor(cursor, limit)
  if (!products?.length) {
    return response(res, 'No se encontraron los productos', { status: 404 })
  }
  
  res.json({
    products,
    nextCursor: nextCursor ? cursorToB64(nextCursor) : null
  })
}

export async function getProduct (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getProductById(id)
  if (!product) {
    return response(res, 'No se encontró el producto', { status: 404 })
  }
  
  res.json(product)
}
