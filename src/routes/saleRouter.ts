import { getSale } from '@/controllers/saleController'
import { Router } from 'express'

export const saleRouter = Router()

saleRouter.get('/:id', getSale)
