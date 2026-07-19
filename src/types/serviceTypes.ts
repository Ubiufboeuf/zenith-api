export type CreateResult<T> = {
  success: false
  error: string
  status: number
} | ({
  success: true
} & T)
