export interface IDatabase<T = Record<string, any>> {
  query<R = any>(sql: string, params?: any[]): Promise<R>
  findAll(table: string): Promise<T[]>
  findOne(table: string, criteria: Partial<T>): Promise<T | null>
  insert(table: string, data: Partial<T>): Promise<T>
  update(table: string, criteria: Partial<T>, data: Partial<T>): Promise<T>
  delete(table: string, criteria: Partial<T>): Promise<boolean>
}
