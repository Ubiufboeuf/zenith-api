import type { ProductCode, ProductEvent } from '@/types/productsTypes'
import type { Row } from '@libsql/client'
import { normalizeCodeRow, normalizeEventRow } from './normalizers'

interface IndexOptions {
  filter: 'keepAll' | 'onNullishIgnore' | 'onFalsyIgnore'
}

const DefaultOptions: IndexOptions = {
  filter: 'keepAll'
}

export function indexArray<T, R = T> (
  array: T[],
  key: keyof T,
  transform: ((item: T) => R) | null = null,
  options: IndexOptions = DefaultOptions
): Map<string, R[]> {
  return array.reduce((map, item) => {
    const id = String(item[key])

    if (!map.has(id)) {
      map.set(id, [])
    }
    
    const valueToAdd = transform ? transform(item) : item as unknown as R

    if (options.filter === 'onFalsyIgnore' && !valueToAdd) return map
    if (options.filter === 'onNullishIgnore' && valueToAdd == null) return map
    
    map.get(id)!.push(valueToAdd)
    
    return map
  }, new Map<string, R[]>())
}

export function indexCodes (codesRows: Row[]): Map<string, ProductCode[]> {
  return indexArray(
    codesRows as unknown as ProductCode[],
    'product_id',
    (item) => item.id ? normalizeCodeRow(item) : undefined as unknown as ProductCode,
    { filter: 'onNullishIgnore' }
  )
}

export function indexEvents (eventsRows: Row[]): Map<string, ProductEvent[]> {
  return indexArray(
    eventsRows as unknown as ProductEvent[],
    'product_id',
    (item) => item.id ? normalizeEventRow(item) : undefined as unknown as ProductEvent,
    { filter: 'onNullishIgnore' }
  )
}

