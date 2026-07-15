import { SALE_INCLUDE } from '@/lib/constants/sales'
import type { SaleIncludeOption } from '@/types/salesTypes'
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

export function getIncludeOptions (includeString?: string) {
  const include = { ...SALE_INCLUDE }

  if (!includeString) return SALE_INCLUDE

  const items = includeString.split(',')

  if (items.some((i) => i === 'all')) {
    return includeAll(include)
  }

  for (const item of items) {
    if (!item || !(item in SALE_INCLUDE)) continue

    include[item as SaleIncludeOption] = true
  }
  
  return include
}

function includeAll (include: typeof SALE_INCLUDE) {
  const i = { ...include }
  for (const key of Object.keys(include)) {
    i[key as SaleIncludeOption] = true
  }
  return i
}
