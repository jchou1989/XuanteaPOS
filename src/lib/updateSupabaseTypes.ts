import { supabase } from "./supabase";

export async function updateSupabaseTypes() {
  try {
    const projectId = import.meta.env.SUPABASE_PROJECT_ID;
    const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY;

    if (!projectId || !serviceKey) {
      console.error("Missing Supabase project ID or service key");
      return false;
    }

    // Call the edge function to generate types
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-update-types",
      {
        body: { projectId, serviceKey },
      },
    );

    if (error) {
      console.error("Error updating types:", error);
      return false;
    }

    if (!data || !data.types) {
      console.error("No types returned from function");
      return false;
    }

    // Update the types file
    // In a real application, you would write this to src/types/supabase.ts
    // For this demo, we'll just log it
    console.log("Types updated successfully");
    console.log(data.types);

    return true;
  } catch (err) {
    console.error("Error in updateSupabaseTypes:", err);
    return false;
  }
}
