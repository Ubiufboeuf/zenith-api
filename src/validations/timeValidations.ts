import { timestampSchema } from '@/schemas/timeSchemas'

export function validateTimestamp (since: unknown) {
  return timestampSchema.safeParse(since)
}
