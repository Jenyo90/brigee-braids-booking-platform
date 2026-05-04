import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "low" },
              },
              {
                type: "text",
                text: `You are an expert Afrocentric hair braiding stylist. Analyse this image and suggest 3 braiding styles from this list ONLY: Knotless Box Braids, Classic Box Braids, Faux Locs, Senegalese Twists, Ghana Cornrows, Butterfly Locs, Boho Knotless Braids, Jumbo Box Braids.

Return ONLY valid JSON in this exact format with no markdown:
{"suggestions":[{"style":"Style Name","reason":"Why this suits them in one sentence","confidence":0.85,"estimatedPacks":5,"estimatedHours":6},{"style":"...","reason":"...","confidence":0.75,"estimatedPacks":4,"estimatedHours":5},{"style":"...","reason":"...","confidence":0.65,"estimatedPacks":6,"estimatedHours":7}]}`,
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json({ error: "Could not generate suggestions" }, { status: 500 });
  }
}
