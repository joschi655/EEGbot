import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { GuardrailBefund } from "../../src/rules/guardrailClassifier.ts";

const DIR = join(tmpdir(), "eegbot-guardrail");

function zustandsPfad(sessionId: string): string | null {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(sessionId)) return null;
  return join(DIR, `${sessionId}.json`);
}

export async function speichereGuardrailBefund(sessionId: string | undefined, befund: GuardrailBefund): Promise<void> {
  if (!sessionId) return;
  const pfad = zustandsPfad(sessionId);
  if (!pfad) return;
  await mkdir(DIR, { recursive: true, mode: 0o700 });
  await writeFile(pfad, JSON.stringify(befund), { encoding: "utf8", mode: 0o600 });
}

export async function ladeGuardrailBefund(sessionId: string | undefined): Promise<GuardrailBefund | null> {
  if (!sessionId) return null;
  const pfad = zustandsPfad(sessionId);
  if (!pfad) return null;
  try {
    return JSON.parse(await readFile(pfad, "utf8")) as GuardrailBefund;
  } catch {
    return null;
  }
}

export async function loescheGuardrailBefund(sessionId: string | undefined): Promise<void> {
  if (!sessionId) return;
  const pfad = zustandsPfad(sessionId);
  if (!pfad) return;
  await unlink(pfad).catch(() => undefined);
}
