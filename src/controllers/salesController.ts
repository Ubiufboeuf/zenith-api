import { createCursor, cursorFromB64, cursorToB64 } from '@/services/cursorService'
import { getSaleById, getSalesByCursor } from '@/services/salesService'
import { response } from '@/utils/response'
import type { Request, Response } from 'express'

export async function getSales (req: Request, res: Response) {
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
  
  const { list: sales, nextCursor } = await getSalesByCursor(cursor, limit)
  if (!sales?.length) {
    return response(res, 'No se encontraron las ventas', { status: 404 })
  }
  
  res.json({
    sales,
    nextCursor: nextCursor ? cursorToB64(nextCursor) : null
  })
}

export async function getSale (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getSaleById(id)
  if (!product) {
    return response(res, 'No se encontró la venta', { status: 404 })
  }
  
  res.json(product)
}
