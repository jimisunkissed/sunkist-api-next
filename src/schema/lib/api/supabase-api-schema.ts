import { Database } from '@/schema/lib/config/supabase-schema';
import { PostgrestError } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];

export type TableId = keyof Tables;
export type ProtectedTableId = {
  [K in TableId]: K extends `st${string}` ? K : never;
}[TableId];

export type TableRow<T extends TableId> = Tables[T]['Row'];
export type TableInsert<T extends TableId> = Tables[T] extends { Insert: any } ? Tables[T]['Insert'] : never;
export type TableUpdate<T extends TableId> = Tables[T]['Update'];

type FilterFunction =
  | 'eq' // Equal to
  | 'gt' // Greater than
  | 'lt' // Less than
  | 'gte' // Greater than or equal to
  | 'lte' // Less than or equal to
  | 'like' // Case sensitive pattern matching
  | 'ilike' // Case insensitive pattern matching
  | 'is' // Is (typically used for null checks)
  | 'in' // In array of values
  | 'neq' // Not equal to
  | 'contains' // Array contains
  | 'containedBy'; // Array is contained by

export const FILTER_FUNCTION = [
  'eq',
  'gt',
  'lt',
  'gte',
  'lte',
  'like',
  'ilike',
  'is',
  'in',
  'neq',
  'contains',
  'containedBy',
] as const satisfies string[];

export type FilterValue = string | number | boolean | null | Array<string | number | boolean>;

export type TableFilter = {
  column: string;
  func: FilterFunction;
  value: FilterValue;
};

export type TableSort = {
  column: string;
  direction: 'asc' | 'desc';
};

export type SupabaseResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};
