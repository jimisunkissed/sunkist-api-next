import { onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { coreStockIntradaySchema } from '@/schema/lib/pages/api/v1/service/alpha-vantage/core-stock-schema';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(400).send('Request method not allowed');
  const query = req.query;

  const validation = coreStockIntradaySchema.safeParse(query);
  if (!validation.success) return onApiError(req, res, { code: 400, message: validation.error.issues });

  try {
    const { symbol, interval, adjusted, extended_hours, month, outputsize, datatype } = validation.data;

    const baseUrl: string = 'https://www.alphavantage.co/query';
    const API_KEY: string | undefined = process.env.ALPHA_VANTAGE_API_KEY;

    const result = await axios.get(baseUrl, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        adjusted,
        extended_hours,
        month,
        outputsize,
        datatype,
        apikey: API_KEY,
      },
    });

    return onApiSuccess(req, res, result.data);
  } catch (error) {
    return onApiError(req, res, error);
  }
}
