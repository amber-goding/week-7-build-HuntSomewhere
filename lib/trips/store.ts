import type { PrismaClient } from "../generated/prisma/client";
import type { ReserveOutcome } from "./ai";
import { tripPreferencesSchema, type TripPreferences } from "./preferences";

export const DEMO_ALLOWANCE_ID = "gate-demo";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One atomic statement: the row only changes while calls remain, so concurrent
// requests can never exceed max_calls.
export async function reserveAiCall(prisma: PrismaClient, allowanceId = DEMO_ALLOWANCE_ID): Promise<ReserveOutcome> {
  const updated = await prisma.$executeRaw`
    UPDATE ai_allowances
    SET used_calls = used_calls + 1, updated_at = now()
    WHERE id = ${allowanceId} AND enabled AND used_calls < max_calls`;
  if (updated === 1) return "reserved";
  const row = await prisma.aiAllowance.findUnique({ where: { id: allowanceId }, select: { enabled: true } });
  return row && !row.enabled ? "disabled" : "exhausted";
}

export type SaveTripResult = { ok: true; id: string } | { ok: false; message: string };

export async function createTrip(
  prisma: PrismaClient,
  input: unknown,
  options: { aiAssisted: boolean; isSynthetic?: boolean },
): Promise<SaveTripResult> {
  const parsed = tripPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Those preferences aren't valid." };
  }
  const trip = await prisma.trip.create({
    data: { preferences: parsed.data, aiAssisted: options.aiAssisted, isSynthetic: options.isSynthetic ?? false },
    select: { id: true },
  });
  return { ok: true, id: trip.id };
}

export type StoredTrip = {
  id: string;
  preferences: TripPreferences;
  aiAssisted: boolean;
  isSynthetic: boolean;
  createdAt: Date;
};

// Returns null for malformed ids, missing trips, or stored data that no longer validates.
export async function getTrip(prisma: PrismaClient, id: string): Promise<StoredTrip | null> {
  if (!uuid.test(id)) return null;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return null;
  const preferences = tripPreferencesSchema.safeParse(trip.preferences);
  if (!preferences.success) return null;
  return { ...trip, preferences: preferences.data };
}
