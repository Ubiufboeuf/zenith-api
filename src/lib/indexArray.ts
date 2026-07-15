export function indexArray<T> (array: T[], key: keyof T): Map<string, T[]> {
  return array.reduce((map, item) => {
    const id = String(item[key]) // Con esto debería funcionar también con símbolos y números

    if (!map.has(id)) {
      map.set(id, [])
    }
      
    map.get(id)!.push(item as T)
    
    return map
  }, new Map<string, T[]>())
}
