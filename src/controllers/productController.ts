import { getProductById } from '@/services/productSerivce'
import { response } from '@/utils/response'
import type { Request, Response } from 'express'

export async function getProduct (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getProductById(id)
  if (!product) {
    return response(res, 'No se encontró el producto', { status: 404 })
  }
  
  res.json(product)
}
