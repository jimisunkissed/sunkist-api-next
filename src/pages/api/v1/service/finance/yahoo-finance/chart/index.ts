import { errorMessage } from '@/lib/util/general/string-util';
import { onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { yahooFinanceChartSchema } from '@/schema/lib/pages/api/v1/service/yahoo-finance/yahoo-finance-schema';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return onApiError(req, res, 'Request method not allowed');
  const query = req.query;

  const validation = yahooFinanceChartSchema.safeParse(query);
  if (!validation.success) return onApiError(req, res, validation.error.issues);

  try {
    const { symbol } = validation.data;

    const current = Math.round(Date.now() / 1000);
    const params = {
      period1: current - 24 * 60 * 60,
      period2: current,
      interval: '5m',
      events: 'div|split|earn',
      lang: 'en-US',
      region: 'ID',
    };
    const result = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, { params });

    const chart = result.data.chart.result?.[0];
    const meta: any = chart?.meta ?? {};
    const timestamp: number[] = (chart?.timestamp ?? []) as number[];
    const {
      open,
      high,
      low,
      close,
      volume,
    }: { open: (number | null)[]; high: (number | null)[]; low: (number | null)[]; close: (number | null)[]; volume: (number | null)[] } =
      chart?.indicators?.quote?.[0] ?? {};

    const timeseries = timestamp.map((x, i) => ({
      timestamp: x,
      open: open[i],
      high: high[i],
      low: low[i],
      close: close[i],
      volume: volume[i],
    }));

    return onApiSuccess(req, res, { meta, timeseries });
  } catch (error) {
    return onApiError(req, res, errorMessage(error));
  }
}
