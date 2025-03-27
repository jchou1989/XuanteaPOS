// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/getting_started/setup_your_environment
// This entrypoint file does not use any third party dependencies, so it can run
// without the "Deno.json" configuration file.

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get the project ID from the request
    const { projectId, serviceKey } = await req.json();

    if (!projectId || !serviceKey) {
      throw new Error("Project ID and Service Key are required");
    }

    // Generate types using the Supabase CLI
    const typesUrl = `https://supabase.com/dashboard/api/rest/types?project=${projectId}`;

    const response = await fetch(typesUrl, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate types: ${response.statusText}`);
    }

    const types = await response.text();

    return new Response(JSON.stringify({ types }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
