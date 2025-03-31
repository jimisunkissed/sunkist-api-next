import { FILTER_FUNCTION } from '@/schema/lib/api/supabase-api-schema';
import { z } from 'zod';

export const viewSchema = z.object({
  tableId: z.string(),
  id: z.string(),
});

export const viewBatchSchema = z.object({
  tableId: z.string(),
  filters: z
    .array(
      z.object({
        column: z.string(),
        func: z.enum(FILTER_FUNCTION),
        value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number(), z.boolean()]))]),
      })
    )
    .optional()
    .default([]),
  sort: z
    .object({
      column: z.string(),
      direction: z.enum(['asc', 'desc']),
    })
    .optional(),
  page: z.number().int().positive().optional().default(1),
  length: z.number().int().positive().optional().default(10),
});

export const addSchema = z.object({
  tableId: z.string(),
  row: z.record(z.unknown()),
});

export const addBatchSchema = z.object({
  tableId: z.string(),
  rows: z.array(z.record(z.unknown())).nonempty(),
});

export const setSchema = z.object({
  tableId: z.string(),
  id: z.string(),
  row: z.unknown(),
});

export const deleteSchema = z.object({
  tableId: z.string(),
  id: z.string(),
});
