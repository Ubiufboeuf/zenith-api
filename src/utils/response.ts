import type { Response } from 'express'

interface ResponseOptions {
  status: number
}

export function response (res: Response, message: string, options: ResponseOptions) {
  const status = options.status ?? 200
  res.status(status).json({
    message,
    status
  })
}
