import { NextResponse } from "next/server";
import { verifyAgentByAddress } from "@/lib/terminal3";

// Runs server-side only: the agent keys and the SDK's cookie-based session
// (handshake -> authenticate) both require a real HTTP client, not a browser.
export async function POST(req: Request) {
  try {
    const { agentAddress } = await req.json();
    if (typeof agentAddress !== "string") {
      return NextResponse.json(
        { error: "agentAddress is required" },
        { status: 400 }
      );
    }

    const { did, address } = await verifyAgentByAddress(agentAddress);
    return NextResponse.json({ did, address });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    const status = message === "Unknown agent address" ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
