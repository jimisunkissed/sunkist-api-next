import { createClient } from '@supabase/supabase-js';
import { Database } from '@/schema/lib/config/supabase-schema';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!;
const supabaseKey: string = process.env.SUPABASE_KEY!;

const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export { supabaseClient };
