import z from 'zod'

export const timestampSchema = z.iso.datetime()
