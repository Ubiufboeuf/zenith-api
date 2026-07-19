/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductCodesRowSchema, ProductEventsRowSchema } from '@/schemas/db'
import { StrictCreateProductSchema } from '@/schemas/productsSchemas'
import type { Field, FieldIssues } from '@/types/errorTypes'
import { toPascalCase } from '@/utils/strings'
import type { ZodError } from 'zod'

type KeyOfShape = keyof typeof StrictCreateProductSchema.shape
type KeyOfCodes = keyof typeof ProductCodesRowSchema.shape
type KeyOfEvents = keyof typeof ProductEventsRowSchema.shape

interface FieldOptions {
  error: ZodError
  inputFields?: unknown
  joinPattern?: string
}

export function getProductFieldIssues ({ error, inputFields, joinPattern = ', ' }: FieldOptions): FieldIssues {
  const fields: Field[] = []
  const expectedFields: string[] = []
  const receivedFields: string[] = []

  for (const issue of error.issues) {
    const fieldName = issue.path.at(-1)?.toString()

    const fieldSchema =
      StrictCreateProductSchema.shape[fieldName as unknown as KeyOfShape] ??
      ProductCodesRowSchema.shape[fieldName as unknown as KeyOfCodes] ??
      ProductEventsRowSchema.shape[fieldName as unknown as KeyOfEvents]

    let fieldType

    if ('format' in issue) {
      fieldType = issue.format
    } else if (!('expected' in issue) || issue.expected === 'nonoptional') {
      fieldType = getUnwrappedFieldSchema(fieldSchema)
    } else {
      fieldType = toPascalCase(issue.expected)
    }

    let fieldValue = inputFields ? inputFields[fieldName as keyof typeof inputFields] : 'unknown'

    if (fieldType.toLowerCase() === 'uuid') fieldType = fieldType.toUpperCase()
    if (typeof fieldValue === 'string') fieldValue = `"${fieldValue}"`

    expectedFields.push(`${fieldName} (${fieldType})`)
    receivedFields.push(`${fieldName} (${fieldValue})`)

    fields.push({
      name: fieldName ?? '',
      type: fieldType,
      value: fieldValue
    })
  }

  return {
    expected: expectedFields.join(joinPattern),
    received: receivedFields.join(joinPattern),
    fields
  }
}

function getUnwrappedFieldSchema (fieldSchema: any): string {
  if (!fieldSchema) return 'undefined'

  if (fieldSchema.def.innerType) {
    return getUnwrappedFieldSchema(fieldSchema.def.innerType)
  }

  if (fieldSchema.type.toLowerCase() === 'enum') {
    const values = Object.values(fieldSchema.def.entries)
    if (values.length > 0) return values.map((v) => `"${v}"`).join(' | ')
  }

  return toPascalCase(fieldSchema.type)
}
