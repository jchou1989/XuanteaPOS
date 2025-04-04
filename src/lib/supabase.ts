import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Get environment variables with fallbacks for production
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables for debugging
console.log("Supabase URL from env:", supabaseUrl);
console.log("Supabase key available:", !!supabaseAnonKey);

// No fallbacks in production - we need real values
// These values are only used for local development when env vars might be missing
const fallbackUrl = import.meta.env.DEV
  ? "https://your-project-id.supabase.co"
  : null;
const fallbackKey = import.meta.env.DEV ? "your-anon-key" : null;

// Only use fallbacks in development mode
const url =
  supabaseUrl && supabaseUrl !== "undefined" ? supabaseUrl : fallbackUrl;
const key =
  supabaseAnonKey && supabaseAnonKey !== "undefined"
    ? supabaseAnonKey
    : fallbackKey;

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
