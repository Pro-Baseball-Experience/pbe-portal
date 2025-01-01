export type DatabaseQueryResult<T> =
  | { rows: T[]; total: number | null }
  | { error: unknown };
