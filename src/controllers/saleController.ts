import { getSaleById } from '@/services/saleService'
import { response } from '@/utils/response'
import type { Request, Response } from 'express'

export async function getSale (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getSaleById(id)
  if (!product) {
    return response(res, 'No se encontró la venta', { status: 404 })
  }
  
  res.json(product)
}
