import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AWS Signature V4 helpers
function hmacSha256(key: Uint8Array, message: string): Promise<ArrayBuffer> {
  return crypto.subtle
    .importKey("raw", key as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((k) => crypto.subtle.sign("HMAC", k, new TextEncoder().encode(message)));
}

async function sha256(data: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string) {
  const kDate = await hmacSha256(new TextEncoder().encode("AWS4" + key), dateStamp);
  const kRegion = await hmacSha256(new Uint8Array(kDate), region);
  const kService = await hmacSha256(new Uint8Array(kRegion), service);
  const kSigning = await hmacSha256(new Uint8Array(kService), "aws4_request");
  return new Uint8Array(kSigning);
}

async function signRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  accessKey: string,
  secretKey: string,
  region: string,
  service: string
) {
  const urlObj = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  headers["x-amz-date"] = amzDate;
  headers["host"] = urlObj.host;

  const canonicalUri = urlObj.pathname;
  const canonicalQuerystring = urlObj.search ? urlObj.search.slice(1) : "";

  const signedHeaderKeys = Object.keys(headers)
    .map((k) => k.toLowerCase())
    .sort();
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k] || headers[k.split("-").map((p, i) => i === 0 ? p : p[0].toUpperCase() + p.slice(1)).join("")]}\n`).join("");

  // Rebuild canonical headers properly
  const headerMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    headerMap[k.toLowerCase()] = v;
  }
  const properCanonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headerMap[k]}\n`).join("");

  const payloadHash = await sha256(body);

  const canonicalRequest = [method, canonicalUri, canonicalQuerystring, properCanonicalHeaders, signedHeaders, payloadHash].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256(canonicalRequest)].join("\n");

  const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  headers["Authorization"] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return headers;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
    const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return new Response(
        JSON.stringify({ error: "AWS credentials not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { model_id, prompt, region = "us-east-1", max_tokens = 1024 } = await req.json();

    if (!model_id || !prompt) {
      return new Response(
        JSON.stringify({ error: "model_id and prompt are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the Bedrock request body based on model provider
    let bedrockBody: Record<string, unknown>;

    if (model_id.startsWith("anthropic.")) {
      bedrockBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens,
        messages: [{ role: "user", content: prompt }],
      };
    } else if (model_id.startsWith("meta.")) {
      bedrockBody = {
        prompt,
        max_gen_len: max_tokens,
        temperature: 0.7,
      };
    } else if (model_id.startsWith("amazon.titan")) {
      bedrockBody = {
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: max_tokens,
          temperature: 0.7,
        },
      };
    } else {
      // Generic fallback
      bedrockBody = {
        prompt,
        max_tokens,
      };
    }

    const bodyStr = JSON.stringify(bedrockBody);
    const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${model_id}/invoke`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const signedHeaders = await signRequest("POST", url, headers, bodyStr, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, region, "bedrock");

    const bedrockResponse = await fetch(url, {
      method: "POST",
      headers: signedHeaders,
      body: bodyStr,
    });

    if (!bedrockResponse.ok) {
      const errorText = await bedrockResponse.text();
      console.error("Bedrock error:", bedrockResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Bedrock API error [${bedrockResponse.status}]: ${errorText}` }),
        { status: bedrockResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await bedrockResponse.json();

    // Normalize response across model types
    let output = "";
    if (result.content && Array.isArray(result.content)) {
      output = result.content.map((c: { text: string }) => c.text).join("");
    } else if (result.generation) {
      output = result.generation;
    } else if (result.results) {
      output = result.results.map((r: { outputText: string }) => r.outputText).join("");
    } else {
      output = JSON.stringify(result);
    }

    return new Response(
      JSON.stringify({ output, raw: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("bedrock-invoke error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
