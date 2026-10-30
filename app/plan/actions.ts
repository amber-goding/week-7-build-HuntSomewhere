"use server";

import { getPrisma } from "@/lib/db";
import { suggestPreferences, type SuggestResult } from "@/lib/trips/ai";
import { createTrip, reserveAiCall, type SaveTripResult } from "@/lib/trips/store";

function todayInMaryland(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

// The description is used for this one call and never stored or logged.
export async function suggestAction(description: unknown): Promise<SuggestResult> {
  try {
    return await suggestPreferences(description, {
      apiKey: process.env.OPENAI_API_KEY,
      aiSwitchOff: ["1", "true"].includes((process.env.AI_DISABLED ?? "").toLowerCase()),
      reserve: () => reserveAiCall(getPrisma()),
      today: todayInMaryland(),
    });
  } catch (error) {
    // Reaching here means the allowance check itself failed (e.g. database unavailable).
    console.error("ai: suggest failed", error instanceof Error ? error.name : "unknown");
    return {
      ok: false,
      code: "provider_error",
      message: "AI suggestions aren't available right now. You can set your preferences below.",
    };
  }
}

export async function saveTripAction(preferences: unknown, aiAssisted: unknown): Promise<SaveTripResult> {
  try {
    return await createTrip(getPrisma(), preferences, { aiAssisted: aiAssisted === true });
  } catch (error) {
    console.error("trips: save failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, message: "Your trip couldn't be saved right now. Please try again." };
  }
}
