import { createClient } from '@supabase/supabase-js';

// The Vite build process injects these variables from the root .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const warningStyle = 'color: orange; font-size: 14px; font-weight: bold;';
    console.warn('%cWARNING: Supabase credentials are not set.', warningStyle);
    console.warn("The application will not be able to connect to the database. API calls will fail.");
    console.warn("To fix this, please ensure the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are set in your .env file in the project root.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);