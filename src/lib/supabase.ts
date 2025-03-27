import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Get environment variables with fallbacks for production
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for preview mode or production if env vars are missing
const fallbackUrl = "https://xxxxxxxxxxx.supabase.co";
const fallbackKey = "eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables, using fallbacks for preview",
  );
}

// Use fallbacks if actual values are missing (in any environment)
const url =
  !supabaseUrl || supabaseUrl === "undefined" ? fallbackUrl : supabaseUrl;
const key =
  !supabaseAnonKey || supabaseAnonKey === "undefined"
    ? fallbackKey
    : supabaseAnonKey;

// Ensure we always have a URL and key
if (!url) {
  throw new Error(
    "supabaseUrl is required. Please check your environment variables.",
  );
}

if (!key) {
  throw new Error(
    "supabaseAnonKey is required. Please check your environment variables.",
  );
}

// Create client with auto-retry options
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options) => {
      // Add retry logic for fetch operations
      return fetch(url, options).catch((error) => {
        console.warn("Supabase fetch error, retrying:", error);
        return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
          fetch(url, options),
        );
      });
    },
  },
});
