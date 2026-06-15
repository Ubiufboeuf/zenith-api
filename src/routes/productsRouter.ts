import { createProduct, getProduct, getProducts } from '@/controllers/productsController'
import { Router } from 'express'

export const productsRouter = Router()

productsRouter.get('/', getProducts)
productsRouter.post('/', createProduct)

productsRouter.get('/:id', getProduct)
