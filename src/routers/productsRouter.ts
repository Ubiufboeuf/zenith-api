import { getProducts } from '@/controllers/productsController'
import { Router } from 'express'

export const productsRouter = Router()

productsRouter.get('/', getProducts)
