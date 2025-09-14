import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT FOR LOCAL DEVELOPMENT ---
// To get your application working, you need to set up a free Supabase project.
// 1. Go to supabase.com and create a new project.
// 2. In your project, go to Project Settings (the gear icon) > API.
// 3. Find your "Project URL" and your "Project API Key" (the `anon` public one).
// 4. Replace the placeholder strings below with your actual URL and Key.

const supabaseUrl = process.env.SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";

if (supabaseUrl === "https://your-project-id.supabase.co" || supabaseAnonKey === "your-anon-key") {
    const warningStyle = 'color: orange; font-size: 14px; font-weight: bold;';
    console.warn('%cWARNING: Supabase credentials are not set.', warningStyle);
    console.warn("The application is using placeholder credentials and will not be able to connect to a database. API calls will fail.");
    console.warn("To fix this, please follow these steps:");
    console.warn("1. Create a project at supabase.com");
    console.warn("2. Get your Project URL and anon key from the API settings.");
    console.warn("3. Replace the placeholder values in `services/supabaseClient.ts`.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);