import { getProduct } from '@/controllers/productController'
import { Router } from 'express'

export const productRouter = Router()

productRouter.get('/', (_, res) => {
  res.status(404)
  res.end()
})

productRouter.get('/:id', getProduct)
