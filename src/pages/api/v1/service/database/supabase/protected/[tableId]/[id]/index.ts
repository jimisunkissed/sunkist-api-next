import { authSupabase, deleteSupabase, setSupabase, viewSupabase } from '@/lib/api/supabase-api';
import { onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { ProtectedTableId, TableInsert } from '@/schema/lib/api/supabase-api-schema';
import { deleteSchema, setSchema, viewSchema } from '@/schema/lib/pages/api/v1/service/supabase/supabase-public-schema';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedMethods = ['GET', 'PUT', 'DELETE'];
  const method = req.method;
  if (!method || !allowedMethods.includes(method)) return onApiError(req, res, { code: 400, message: 'Request method not allowed' });

  try {
    const org = await authSupabase(req);
    const organization_id = org?.data?.id;
    if (org?.error || !organization_id) return onApiError(req, res, org.error);

    const tableId = req.query.tableId as ProtectedTableId;
    const id = req.query.id as string;

    const validation = viewSchema.safeParse({ tableId, id });
    if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });

    const tableRow = await viewSupabase(tableId, id);
    if (tableRow.error) return onApiError(req, res, tableRow.error);
    if (tableRow.data?.organization_id !== organization_id)
      return onApiError(req, res, { code: 401, message: 'Row has invalid organization_id' });

    if (method === 'GET') {
      return onApiSuccess(req, res, tableRow.data);
    } else if (method === 'PUT') {
      const row = req.body.row as TableInsert<ProtectedTableId>;

      const validation = setSchema.safeParse({ tableId, id, row });
      if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });

      const { data, error } = await setSupabase(tableId, id, row);
      if (error) return onApiError(req, res, error);

      return onApiSuccess(req, res, data);
    } else if (method === 'DELETE') {
      const validation = deleteSchema.safeParse({ tableId, id });
      if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });

      const { data, error } = await deleteSupabase(tableId, id);
      if (error) return onApiError(req, res, error);

      return onApiSuccess(req, res, data);
    }
  } catch (error) {
    return onApiError(req, res, { code: 500, message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
}
