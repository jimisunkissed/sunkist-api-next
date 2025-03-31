import { z } from 'zod';

export const coreStockIntradaySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  interval: z.enum(['1min', '5min', '15min', '30min', '60min']),
  adjusted: z.boolean().optional().default(true),
  extended_hours: z.boolean().optional().default(true),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
    .optional(),
  outputsize: z.enum(['compact', 'full']).optional().default('compact'),
  datatype: z.enum(['json', 'csv']).optional().default('json'),
});

export const coreStockTickerSearchSchema = z.object({
  keywords: z.string(),
  datatype: z.enum(['json', 'csv']).optional().default('json'),
});
