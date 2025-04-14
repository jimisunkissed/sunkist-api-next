import { addBatchSupabase, addSupabase, authSupabase, deleteBatchSupabase, setBatchSupabase, viewBatchSupabase } from '@/lib/api/supabase-api';
import { apiDecodeArray, apiDecodeObject, apiParseNumber, onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { ProtectedTableId, TableFilter, TableInsert, TableSort } from '@/schema/lib/api/supabase-api-schema';
import {
  addBatchSchema,
  addSchema,
  deleteBatchSchema,
  setBatchSchema,
  viewBatchSchema,
} from '@/schema/lib/pages/api/v1/service/supabase/supabase-public-schema';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  const method = req.method;
  if (!method || !allowedMethods.includes(method)) return onApiError(req, res, { code: 400, message: 'Request method not allowed' });

  try {
    const org = await authSupabase(req);
    const organization_id = org?.data?.id;
    if (org?.error || !organization_id) return onApiError(req, res, org.error);

    const tableId = req.query.tableId as ProtectedTableId;

    if (method === 'GET') {
      const parsedFilters = apiDecodeArray(req.query.filters as string) as TableFilter[];
      const parsedSort = apiDecodeObject(req.query.sort as string) as TableSort;
      const parsedPage = apiParseNumber(req.query.page);
      const parsedLength = apiParseNumber(req.query.length);

      const validation = viewBatchSchema.safeParse({
        tableId,
        filters: parsedFilters,
        sort: parsedSort,
        page: parsedPage,
        length: parsedLength,
      });
      if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });
      const { filters, sort, page, length } = validation.data;

      const orgFilterIndex = filters.findIndex((x) => x.column === 'organization_id');
      if (orgFilterIndex >= 0) filters[orgFilterIndex] = { column: 'organization_id', func: 'eq', value: organization_id };
      else filters.push({ column: 'organization_id', func: 'eq', value: organization_id });

      const { data, error } = await viewBatchSupabase(tableId, filters, sort, page, length);
      if (error) return onApiError(req, res, error);

      return onApiSuccess(req, res, data);
    } else if (method === 'POST') {
      const batch = (req.body.batch ?? false) as boolean;

      if (!batch) {
        const row = req.body.row as TableInsert<ProtectedTableId>;

        const validation = addSchema.safeParse({ tableId, row });
        if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });

        const verifiedRow = { ...row, organization_id };
        const { data, error } = await addSupabase(tableId, verifiedRow);
        if (error) return onApiError(req, res, error);

        return onApiSuccess(req, res, data);
      } else {
        const rows = req.body.rows as TableInsert<ProtectedTableId>[];

        const validation = addBatchSchema.safeParse({ tableId, rows });
        if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });
        if (rows.length > 500) return onApiError(req, res, { code: 400, message: 'Batch size exceeds 500 rows' });

        const verifiedRows = rows.map((row) => ({ ...row, organization_id }));
        const { data, error } = await addBatchSupabase(tableId, verifiedRows);
        if (error) return onApiError(req, res, data);

        return onApiSuccess(req, res, data);
      }
    } else if (method === 'PUT') {
      const rows = req.body.rows as TableInsert<ProtectedTableId>[];

      const validation = setBatchSchema.safeParse({ tableId, rows });
      if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });
      if (rows.length > 500) return onApiError(req, res, { code: 400, message: 'Batch size exceeds 500 rows' });

      const { data, error } = await setBatchSupabase(tableId, rows, { organization_id });
      if (error) return onApiError(req, res, error);

      return onApiSuccess(req, res, data);
    } else if (method === 'DELETE') {
      const ids = req.body.ids as (string | number)[];

      const validation = deleteBatchSchema.safeParse({ tableId, ids });
      if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });
      if (ids.length > 500) return onApiError(req, res, { code: 400, message: 'Batch size exceeds 500 rows' });

      const { data, error } = await deleteBatchSupabase(tableId, ids, { organization_id });
      if (error) return onApiError(req, res, error);

      return onApiSuccess(req, res, data);
    }
  } catch (error) {
    return onApiError(req, res, { code: 500, message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
}
