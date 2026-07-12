import z from 'zod'

const limitSchema = z.coerce
  .number({ error: 'El límite debe ser un número' })
  .int('El límite debe ser un número entero')
  .positive('El límite debe ser mayor a 0')

export function validateLimit (limit: unknown) {
  return limitSchema.safeParse(limit)
}
