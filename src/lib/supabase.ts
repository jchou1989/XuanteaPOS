import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for preview mode
const fallbackUrl = "https://xxxxxxxxxxx.supabase.co";
const fallbackKey = "eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables, using fallbacks for preview",
  );
}

// Use fallbacks in preview mode if actual values are missing
const url =
  import.meta.env.VITE_TEMPO === "true" &&
  (!supabaseUrl || supabaseUrl === "undefined")
    ? fallbackUrl
    : supabaseUrl;
const key =
  import.meta.env.VITE_TEMPO === "true" &&
  (!supabaseAnonKey || supabaseAnonKey === "undefined")
    ? fallbackKey
    : supabaseAnonKey;

// Create client with auto-retry options
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      // Add retry logic for fetch operations
      return fetch(...args).catch((error) => {
        console.warn("Supabase fetch error, retrying:", error);
        return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
          fetch(...args),
        );
      });
    },
  },
});
