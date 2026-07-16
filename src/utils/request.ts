import type { Request } from 'express'

export function getBody (req: Request) {
  return new Promise((res, rej) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      res(body)
    })

    req.on('error', (err) => {
      rej(err)
    })
  })
}
