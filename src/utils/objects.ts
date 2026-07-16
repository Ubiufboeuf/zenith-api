export function toEnableAll (object: Record<string, boolean>) {
  const i = { ...object }
  for (const key of Object.keys(i)) {
    i[key] = true
  }
  return i
}

export function isSomeEnabled (object: Record<string, boolean>) {
  return Object.values(object).some((v) => v)
}

export function isEveryEnabled (object: Record<string, boolean>) {
  return Object.values(object).every((v) => v)
}
