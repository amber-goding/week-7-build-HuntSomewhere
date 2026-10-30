// Seeds the genuine public data sources. Run explicitly: `npm run db:seed`.
// Never runs during install, build, or rendering.
//
// Per source: create if the slug is absent; do nothing if every value
// matches; stop without writing if any value differs.
import { createHash } from "node:crypto";
import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma, PrismaClient } from "../lib/generated/prisma/client";

config({ path: ".env.local", quiet: true });

type SourceSeed = {
  slug: string;
  name: string;
  url: string;
  attribution: string;
  reuseTerms: string;
  // SHA-256 of reuseTerms as retrieved; guards against accidental edits.
  reuseTermsSha256: string;
};

// Values from the official catalog item a5de633b6ebf450b94dcb08b519c3414
// (owner mdimapdatacatalog), retrieved 2026-10-30 and recorded in
// project-plan.md §3.4 and §3.6.
const SOURCES: SourceSeed[] = [
  {
    slug: "md-imap-dnr-owned-lands",
    name: "Maryland Protected Lands - DNR Owned Properties and Conservation Easements",
    url: "https://www.arcgis.com/home/item.html?id=a5de633b6ebf450b94dcb08b519c3414",
    attribution: "MD iMAP, DNR",
    reuseTerms:
      'The Spatial Data, and the information therein, (collectively the "Data") is provided "as is" without warranty of any kind, either expressed, implied, or statutory. The user assumes the entire risk as to quality and performance of the Data. No guarantee of accuracy is granted, nor is any responsibility for reliance thereon assumed. In no event shall the State of Maryland be liable for direct, indirect, incidental, consequential or special damages of any kind. The State of Maryland does not accept liability for any damages or misrepresentation caused by inaccuracies in the Data or as a result to changes to the Data, nor is there responsibility assumed to maintain the Data in any manner or form. The Data can be freely distributed as long as the metadata entry is not modified or deleted. Any data derived from the Data must acknowledge the State of Maryland in the metadata.',
    reuseTermsSha256: "2555e9bc6280c3ed421e03aa25f5a25546d5ebbeb5733641348c44dd477794da",
  },
];

const COMPARED_FIELDS = ["name", "url", "attribution", "reuseTerms"] as const;

type Outcome = "created" | "unchanged" | "conflict";

async function seedSource(prisma: PrismaClient, source: SourceSeed): Promise<Outcome> {
  const actualHash = createHash("sha256").update(source.reuseTerms, "utf8").digest("hex");
  if (actualHash !== source.reuseTermsSha256) {
    throw new Error(`reuseTerms for ${source.slug} do not match the recorded hash; refusing to write.`);
  }

  const intended = {
    slug: source.slug,
    name: source.name,
    url: source.url,
    attribution: source.attribution,
    reuseTerms: source.reuseTerms,
  };

  let existing = await prisma.dataSource.findUnique({ where: { slug: source.slug } });
  if (!existing) {
    try {
      await prisma.dataSource.create({ data: intended });
      return "created";
    } catch (error) {
      // Another run created it between the read and the insert: compare instead.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
        throw error;
      }
      existing = await prisma.dataSource.findUnique({ where: { slug: source.slug } });
      if (!existing) throw error;
    }
  }

  const differing = COMPARED_FIELDS.filter((field) => existing[field] !== intended[field]);
  if (differing.length > 0) {
    console.error(`conflict: ${source.slug} differs in ${differing.join(", ")}; nothing was changed.`);
    return "conflict";
  }
  return "unchanged";
}

function describe(error: unknown): string {
  // Never print raw database errors: they can include connection details.
  if (error instanceof Prisma.PrismaClientKnownRequestError) return `database error ${error.code}`;
  if (error instanceof Error && error.message.startsWith("reuseTerms for")) return error.message;
  return error instanceof Error ? error.name : "unknown error";
}

async function main(): Promise<number> {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    console.error("DATABASE_URL_UNPOOLED is not set (expected in .env.local).");
    return 1;
  }

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  let exitCode = 0;
  try {
    for (const source of SOURCES) {
      const outcome = await seedSource(prisma, source);
      console.log(`${source.slug}: ${outcome}`);
      if (outcome === "conflict") exitCode = 2;
    }
  } catch (error) {
    console.error(`seed failed: ${describe(error)}`);
    exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
  return exitCode;
}

main().then((code) => {
  process.exitCode = code;
});
