import { errorMessage } from '@/lib/util/general/string-util';
import { onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return onApiError(req, res, 'Request method not allowed');
  const query = req.query;

  try {
    const { q = '' } = query;

    const result = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', { params: { q } });

    return onApiSuccess(req, res, result.data);
  } catch (error) {
    return onApiError(req, res, errorMessage(error));
  }
}
