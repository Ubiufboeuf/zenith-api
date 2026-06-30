import type { Response } from 'express'

interface ResponseOptions {
  status: number
}

export function response (res: Response, message: string, options?: Partial<ResponseOptions>) {
  const status = options?.status ?? 200
  res.status(status).json({
    message,
    status
  })
}

export function success (res: Response, data: object) {
  res.status(200).json({
    success: true,
    ...data
  })
}

export function failure (res: Response, message: string, options?: Partial<ResponseOptions>) {
  const status = options?.status ?? 200
  res.status(status).json({
    success: false,
    status,
    message
  })
}
