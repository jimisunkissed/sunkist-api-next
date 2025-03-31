import { deleteSupabase, setSupabase, viewSupabase } from '@/lib/api/supabase-api';
import { onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = req.headers;
  const body = req.body;
  console.log({ headers, body });

  try {
    const app_id: string | undefined = headers?.['x-app-id'] as string | undefined;
    const app_code: string | undefined = headers?.['x-app-code'] as string | undefined;
    if (!app_id || !app_code) return onApiError(req, res, { code: 400, message: 'app_id and app_code not found' });

    const app = await viewSupabase('app', app_id);
    if (app?.data?.id !== app_id || app?.data?.code !== app_code)
      return onApiError(req, res, { code: 400, message: 'app_id and app_code not found' });

    const type: string = body?.type ?? '';
    const allowed_type = ['organization.created', 'organization.updated', 'organization.deleted'];
    if (!allowed_type.includes(type)) return onApiError(req, res, { code: 400, message: 'type not allowed' });

    if (type === 'organization.created' || type === 'organization.updated') {
      const id: string = body?.data?.id ?? '';
      const name: string = body?.data?.name ?? '';
      const slug: string = body?.data?.slug ?? '';
      if (!id || !name || !slug) return onApiError(req, res, { code: 400, message: 'id, name & slug is required' });

      const response = await setSupabase('organization', id, {
        app_id,
        app_code,
        is_production: process.env.NODE_ENV === 'production' ? true : false,
        name,
        slug,
      });
      return onApiSuccess(req, res, response);
    } else {
      const id: string = body?.data?.id ?? '';
      if (!id) return onApiError(req, res, { code: 400, message: 'id is required' });

      const response = await deleteSupabase('organization', id);
      return onApiSuccess(req, res, response);
    }
  } catch (error) {
    return onApiError(req, res, error);
  }
}
