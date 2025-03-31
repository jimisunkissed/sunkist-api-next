import { z } from 'zod';

export const yahooFinanceChartSchema = z.object({
  symbol: z.string(),
});
