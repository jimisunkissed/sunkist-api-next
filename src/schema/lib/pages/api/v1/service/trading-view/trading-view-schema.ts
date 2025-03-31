import { z } from 'zod';

export const tradingViewTranslatorSchema = z.object({
  from: z.string(),
  date: z.string(),
  type: z.string(),
});
