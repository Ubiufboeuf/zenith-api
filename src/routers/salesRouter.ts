import { getSale, getSales } from '@/controllers/salesController'
import { Router } from 'express'

export const salesRouter = Router()

salesRouter.get('/', getSales)
salesRouter.get('/:id', getSale)
