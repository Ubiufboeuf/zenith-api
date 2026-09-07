import { envOrigins } from '@/lib/constants/envConstants'
import type { NextFunction, Request, Response } from 'express'

export const corsMiddleware = ({ acceptedOrigins = [] } = {}) => (req: Request, res: Response, next: NextFunction) => {
  const origins: string[] = [...envOrigins, ...acceptedOrigins]
  
  const origin = req.header('origin')
  const isPreflight = req.method === 'OPTIONS'

  if (origin && origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)

    if (isPreflight) {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.status(204).end()
      return
    }
  }

  next()
}
