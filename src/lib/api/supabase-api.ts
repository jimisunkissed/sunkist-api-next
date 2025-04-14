import { supabaseClient } from '@/lib/config/supabase-config';
import { SupabaseResponse, TableFilter, TableInsert, TableId, TableRow, TableSort } from '@/schema/lib/api/supabase-api-schema';
import { PostgrestError } from '@supabase/supabase-js';
import { formatISO } from 'date-fns';
import { NextApiRequest } from 'next';

export const authSupabase = async (req: NextApiRequest): Promise<SupabaseResponse<TableRow<'adm_organization'>>> => {
  try {
    const method = req.method ?? '';
    const tableId: string = (req?.query?.tableId ?? '') as string;
    const appId = (req?.headers?.['x-app-id'] ?? '') as string;
    const appCode = (req?.headers?.['x-app-code'] ?? '') as string;
    const orgId = (req?.headers?.['x-org-id'] ?? '') as string;
    const orgRole = (req?.headers?.['x-org-role'] ?? '') as string;

    if ([method, tableId, appId, appCode, orgId, orgRole].some((x) => !x))
      return {
        data: null,
        error: {
          code: '400',
          name: 'Bad Request',
          message: 'Found missing headers',
          details: 'Required headers must be non-empty string',
          hint: 'Check your request headers',
        },
      };

    if (!tableId.startsWith(appCode))
      return {
        data: null,
        error: {
          code: '401',
          name: 'Unauthorized access',
          message: 'Table not allowed for app',
          details: 'Table ID beyond scope',
          hint: 'Check your request headers',
        },
      };

    if (!['GET', 'OPTIONS'].includes(method) && orgRole !== 'org:admin')
      return {
        data: null,
        error: {
          code: '401',
          name: 'Unauthorized access',
          message: 'Method not allowed for user',
          details: 'Request method beyond scope',
          hint: 'Check your request headers',
        },
      };

    const query = supabaseClient.from('adm_organization').select().eq('app_id', appId).eq('app_code', appCode).eq('id', orgId).single();
    const { data, error } = await query;
    if (!data)
      return {
        data: null,
        error: {
          code: '401',
          name: 'Unauthorized access',
          message: 'Organization not found',
          details: 'Organization beyond scope',
          hint: 'Check your request headers',
        },
      };

    return { data, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const viewSupabase = async <T extends TableId>(tableId: T, id: any): Promise<SupabaseResponse<TableRow<T>>> => {
  try {
    const { data, error } = await supabaseClient.from(tableId).select().eq('id', id).single();
    return { data: data as TableRow<T> | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const viewBatchSupabase = async <T extends TableId>(
  tableId: T,
  filters?: TableFilter[],
  sort?: TableSort,
  page: number = 1,
  length: number = 10
): Promise<SupabaseResponse<TableRow<T>[]>> => {
  try {
    let query = supabaseClient.from(tableId).select();
    if (filters && Array.isArray(filters))
      filters.forEach(({ func, column, value }) => {
        query = (query as any)[func](column, value);
      });
    if (sort) query = (query as any).order(sort.column, { ascending: sort.direction === 'asc', nullsFirst: false });
    query = (query as any).range((page - 1) * length, page * length - 1);

    const { data, error } = await query;
    return { data: data as TableRow<T>[] | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const addSupabase = async <T extends TableId>(tableId: T, row: TableInsert<T>): Promise<SupabaseResponse<TableRow<T>>> => {
  try {
    const timestamp = formatISO(new Date());

    const newRow: TableInsert<T> = {
      ...row,
      created_at: timestamp,
      updated_at: timestamp,
    } as TableInsert<T>;
    const { data, error } = await supabaseClient.from(tableId).insert(newRow).select().single();

    return { data: data as TableRow<T> | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const addBatchSupabase = async <T extends TableId>(tableId: T, rows: TableInsert<T>[]): Promise<SupabaseResponse<TableRow<T>>> => {
  try {
    const timestamp = formatISO(new Date());

    const newRows: TableInsert<T>[] = rows.map((row) => ({ ...row, created_at: timestamp, updated_at: timestamp }));
    const { data, error } = await supabaseClient.from(tableId).insert(newRows).select();

    return { data: data as TableRow<T> | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const setSupabase = async <T extends TableId>(tableId: T, id: any, row: TableInsert<T>): Promise<SupabaseResponse<TableRow<T>>> => {
  try {
    const { created_at, updated_at, ...cleanRow } = row;
    const timestamp = formatISO(new Date());

    const { data: existingRow } = await supabaseClient.from(tableId).select('id').eq('id', id).single();
    const setRow: TableInsert<T> = {
      ...cleanRow,
      id,
      updated_at: timestamp,
    } as TableInsert<T>;
    if (!existingRow) setRow.created_at = timestamp;
    const { data, error } = await supabaseClient.from(tableId).upsert(setRow).select().single();

    return { data: data as TableRow<T> | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const setBatchSupabase = async <T extends TableId>(
  tableId: T,
  rows: TableInsert<T>[],
  staticColumn: Record<string, any> = {}
): Promise<SupabaseResponse<TableRow<T>[]>> => {
  try {
    const timestamp = formatISO(new Date());

    const ids = rows.map((row) => row.id);
    const staticKeys = Object.keys(staticColumn);
    const { data: existingRows } = (await supabaseClient
      .from(tableId)
      .select(['id', ...staticKeys].join(', '))
      .in('id', ids)) as { data: TableInsert<T>[] };

    if (existingRows.some((row) => staticKeys.some((k) => row?.[k] !== staticColumn[k])))
      return {
        data: null,
        error: {
          code: '400',
          name: 'Bad Request',
          message: `Row contains invalid ${staticKeys.join(', ')}`,
          details: 'Static column cannot be changed',
          hint: "Check your rows' static keys",
        } as PostgrestError,
      };
    const existingIds = new Set(existingRows?.map((row) => row.id));

    const setRows: TableInsert<T>[] = rows.map(({ id, ...row }) => {
      const { created_at, updated_at, ...cleanRow } = row;
      const setRow: TableInsert<T> = {
        ...cleanRow,
        id,
        updated_at: timestamp,
      } as TableInsert<T>;
      if (!existingIds.has(id)) setRow.created_at = timestamp;
      return setRow;
    });

    const { data, error } = await supabaseClient.from(tableId).upsert(setRows).select();

    return { data: data as TableRow<T>[] | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const deleteSupabase = async <T extends TableId>(tableId: T, id: any): Promise<SupabaseResponse<{ id: any }>> => {
  try {
    const { error } = await supabaseClient.from(tableId).delete().eq('id', id).single();
    return { data: { id }, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};

export const deleteBatchSupabase = async <T extends TableId>(
  tableId: T,
  ids: (string | number)[],
  staticColumn: Record<string, any> = {}
): Promise<SupabaseResponse<{ id: string | number }[]>> => {
  try {
    const staticKeys = Object.keys(staticColumn);
    if (staticKeys.length) {
      const { data: existingRows } = (await supabaseClient
        .from(tableId)
        .select(['id', ...staticKeys].join(', '))
        .in('id', ids)) as { data: TableInsert<T>[] };
      if (existingRows.some((row) => staticKeys.some((k) => row?.[k] !== staticColumn[k])))
        return {
          data: null,
          error: {
            code: '400',
            name: 'Bad Request',
            message: `Row contains invalid ${staticKeys.join(', ')}`,
            details: 'Static column should match',
            hint: "Check your rows' static keys",
          } as PostgrestError,
        };
    }

    const { data, error } = await supabaseClient.from(tableId).delete().in('id', ids).select('id');
    return { data: data as { id: string | number }[] | null, error };
  } catch (error) {
    return { data: null, error: error as PostgrestError };
  }
};
