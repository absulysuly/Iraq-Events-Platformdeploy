import { createClient } from '@supabase/supabase-js';

// FIX: Changed from Vite-specific `import.meta.env` to standard `process.env` to resolve TypeScript errors.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const warningStyle = 'color: orange; font-size: 14px; font-weight: bold;';
    console.warn('%cWARNING: Supabase credentials are not set.', warningStyle);
    console.warn("The application will not be able to connect to the database. API calls will fail.");
    // FIX: Updated warning message to reflect the change to `process.env`.
    console.warn("To fix this, please ensure the SUPABASE_URL and SUPABASE_ANON_KEY environment variables are set.");
}


export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
