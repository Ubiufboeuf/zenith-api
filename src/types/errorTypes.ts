export interface FieldIssues {
  fields: Field[]
  expected: string
  received: string
}

export interface Field {
  name: string
  type: string
  value: unknown
}
