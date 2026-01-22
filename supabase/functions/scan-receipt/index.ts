import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { status: 400, headers }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(bytes))
    );

   const visionRes = await fetch(
  "https://vision.googleapis.com/v1/images:annotate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": Deno.env.get("GOOGLE_VISION_API_KEY")!,
    },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
          ],
          imageContext: {
            languageHints: ["en"],
          },
        },
      ],
    }),
  }
);


    const visionData = await visionRes.json();
    const text =
      visionData?.responses?.[0]?.fullTextAnnotation?.text || "";

    return new Response(JSON.stringify({ text }), {
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "OCR failed" }),
      { status: 500, headers }
    );
  }
});
