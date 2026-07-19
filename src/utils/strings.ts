export function toPascalCase (str: string): string {
  return str
    .match(/[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+[a-z]*/g)!
    .map((p) => p[0]?.toUpperCase() + p.slice(1).toLowerCase())
    .join('')
}
