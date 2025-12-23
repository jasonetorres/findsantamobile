import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No text provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const voiceResponse = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/1wg2wOjdEWKA7yQD8Kca",
      {
        method: "POST",
        headers: {
          "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5",
        }),
      }
    );

    if (!voiceResponse.ok) {
      const error = await voiceResponse.text();
      return new Response(
        JSON.stringify({ error: "Voice generation failed", details: error }),
        {
          status: voiceResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const audioBlob = await voiceResponse.blob();

    return new Response(audioBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});