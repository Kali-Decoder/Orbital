import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are a Research Agent. Given a topic, return a brief structured report with EXACTLY:
- 3 key facts (1 sentence each)
- 2 market trends (1 sentence each)
- 3 notable companies (name + one phrase)

No preamble. No conclusion. Use markdown headers and bullet points. Maximum 200 words total.`,
  analysis: `You are an Analysis Agent. Based on the research provided, return EXACTLY:
- 2 key insights (2 sentences each)
- 1 opportunity (1 sentence)
- 1 risk (1 sentence)

No preamble. Use markdown. Maximum 150 words total.`,
  writer: `You are a Writer Agent. Based on the analysis provided, write a brief report with EXACTLY:
- Executive Summary: 2 sentences
- Key Findings: 3 bullet points (1 sentence each)
- Recommendation: 2 sentences

No preamble. Use markdown. Maximum 150 words total.`,
};

// Runs server-side only: never expose GROQ_API_KEY to the browser.
export async function POST(req: Request) {
  try {
    const { agentRole, goal, previousOutput } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS[agentRole];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Unknown agentRole" }, { status: 400 });
    }
    if (typeof goal !== "string" || !goal.trim()) {
      return NextResponse.json({ error: "goal is required" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    const userPrompt =
      typeof previousOutput === "string" && previousOutput.trim()
        ? `Goal: ${goal}\n\nInput from previous agent:\n${previousOutput}`
        : `Goal: ${goal}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
    });
    const output = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ output, agentRole });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
