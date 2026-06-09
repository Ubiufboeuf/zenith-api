import { getProduct } from '@/controllers/productController'
import { Router } from 'express'

export const productRouter = Router()

productRouter.get('/:id', getProduct)
