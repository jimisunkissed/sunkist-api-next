import { deleteSupabase, setSupabase, viewSupabase } from '@/lib/api/supabase-api';
import { onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = req.headers;
  const body = req.body;

  try {
    const app_id: string | undefined = headers?.['x-app-id'] as string | undefined;
    const app_code: string | undefined = headers?.['x-app-code'] as string | undefined;
    if (!app_id || !app_code) return onApiError(req, res, { code: 400, message: 'app_id and app_code not found' });

    const app = await viewSupabase('app', app_id);
    if (app?.data?.id !== app_id || app?.data?.code !== app_code)
      return onApiError(req, res, { code: 400, message: 'app_id and app_code not found' });

    const type: string = body?.type ?? '';
    const allowed_type = ['user.created', 'user.updated', 'user.deleted'];
    if (!allowed_type.includes(type)) return onApiError(req, res, { code: 400, message: 'type not allowed' });

    if (type === 'user.created' || type === 'user.updated') {
      const id: string = body?.data?.id ?? '';
      const email: string = body?.data?.email_addresses?.[0]?.email_address ?? '';
      const first_name: string = body?.data?.first_name ?? '';
      const last_name: string = body?.data?.last_name ?? '';
      if (!id || !email) return onApiError(req, res, { code: 400, message: 'id & email is required' });

      const response = await setSupabase('user', id, {
        id,
        app_id,
        app_code,
        is_production: process.env.NODE_ENV === 'production' ? true : false,
        email,
        first_name,
        last_name,
      });
      return onApiSuccess(req, res, response);
    } else {
      const id: string = body?.data?.id ?? '';
      if (!id) return onApiError(req, res, { code: 400, message: 'id is required' });

      const response = await deleteSupabase('user', id);
      return onApiSuccess(req, res, response);
    }
  } catch (error) {
    return onApiError(req, res, error);
  }
}
