/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductEventsRowSchema } from '@/schemas/dbSchemas'
import { ProductCodeSchema } from '@/schemas/productsSchemas'
import type { ProductCode, ProductEvent } from '@/types/productsTypes'
import type { Row } from '@libsql/client'

type Strictness = 'high' | 'low' | 'none'

export function normalizeCodeRow (item: any, strictness?: 'none'): any
export function normalizeCodeRow (item: any, strictness?: 'low'): ProductCode
export function normalizeCodeRow (item: any, strictness?: 'high'): ProductCode | undefined

export function normalizeCodeRow (item: any, strictness: Strictness = 'low') {
  let value

  if (strictness === 'none') value = item as any
  if (strictness === 'low') value = item as Row
  if (strictness === 'high') {
    const validation = ProductCodeSchema.safeParse(item)
    if (!validation.success) return
    value = validation.data
  }
  
  return {
    id: value.id ?? value.code_id,
    product_id: value.product_id,
    code: value.code,
    type: value.type,
    is_main: value.is_main
  }
}
export function normalizeEventRow (item: any, strictness?: 'none'): any
export function normalizeEventRow (item: any, strictness?: 'low'): ProductEvent
export function normalizeEventRow (item: any, strictness?: 'high'): ProductEvent | undefined

export function normalizeEventRow (item: Row, strictness: Strictness = 'low') {
  let value

  if (strictness === 'none') value = item as any
  if (strictness === 'low') value = item as Row
  if (strictness === 'high') {
    const validation = ProductEventsRowSchema.safeParse(item)
    if (!validation.success) return
    value = validation.data
  }

  return {
    id: value.id ?? value.code_id,
    product_id: value.product_id,
    created_at: value.created_at,
    event_type: value.event_type,
    new_value: value.new_value,
    previous_value: value.previous_value
  }
}
