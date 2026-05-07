import {
  VitalsData,
  NeuroData,
  MarchData,
  QwenRiskResult,
  PayloadItem,
} from "../types";
import { getContext, getStopWords, isModelLoaded } from "./modelManager";
import {
  RISK_SCORING_PROMPT,
  FIELD_EXTRACTION_PROMPT,
  BUDDY_SYSTEM_PROMPT,
} from "./prompts";

const TEMPERATURE = 0.1;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPatientContext(
  vitals: VitalsData,
  neuro: NeuroData,
  march: MarchData,
  shootdownRisk: number | null,
): string {
  const marchFlags = Object.entries(march)
    .filter(([_, v]) => v != null)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  return [
    `GCS: ${neuro.gcs ?? "unknown"}`,
    `GCS components: Eye ${neuro.gcsEye ?? "unknown"}, Verbal ${neuro.gcsVerbal ?? "unknown"}, Motor ${neuro.gcsMotor ?? "unknown"}`,
    `Consciousness: ${neuro.consciousness ?? "unknown"}`,
    `Seizure: ${neuro.seizure}`,
    `Vomiting: ${neuro.vomiting}`,
    `Suspected ICP elevation: ${neuro.suspectedICP ? "yes" : "no"}`,
    `Pupils: right ${neuro.rightPupil}, left ${neuro.leftPupil}`,
    `BP: ${vitals.bpSystolic ?? "?"}/${vitals.bpDiastolic ?? "?"} mmHg`,
    `HR: ${vitals.heartRate ?? "unknown"} bpm`,
    `SpO2: ${vitals.oxygenSaturation ?? "unknown"}%`,
    `Temp: ${vitals.temperatureC ?? "unknown"} °C`,
    `Injury Location: ${Array.from(neuro.injuryLocation).join(", ") || "unknown"}`,
    `MARCH: ${marchFlags || "all clear"}`,
    `Shootdown Risk: ${shootdownRisk ?? "unknown"}%`,
    neuro.notes ? `Notes: ${neuro.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function stripThinking(raw: string): string {
  // Strip complete <think>...</think> blocks
  let result = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  // Strip unclosed <think> blocks (generation cut off before </think>)
  result = result.replace(/<think>[\s\S]*/g, "").trim();
  return result;
}

function parseJSON(raw: string): any | null {
  try {
    const cleaned = stripThinking(raw);
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

function stubRisk(
  march: MarchData,
): QwenRiskResult & { payloadItems: PayloadItem[] } {
  return {
    level: "HIGH",
    probability:
      "~60% risk of severe injury without intervention within 2–4 hours",
    recommendations: [
      "Secure airway — assess consciousness",
      "Initiate hyperosmolar therapy: Hypertonic saline 250mL bolus",
      "Priority evacuation — request window immediately",
    ],
    bpAlert:
      march.hemorrhage === "UNCONTROLLED"
        ? "Active hemorrhage: Target systolic ~120 mmHg for cerebral perfusion."
        : null,
    loading: false,
    error: null,
    payloadItems: [
      { id: "1", name: "Saline", included: true },
      { id: "2", name: "Blood", included: true },
      { id: "3", name: "Ice Packs", included: true },
      { id: "4", name: "Heat Lamps", included: true },
    ],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function assessRisk(
  vitals: VitalsData,
  neuro: NeuroData,
  march: MarchData,
  shootdownRisk: number | null,
): Promise<QwenRiskResult & { payloadItems: PayloadItem[] }> {
  if (!isModelLoaded()) {
    console.log("assessRisk: model not loaded, using stub");
    await new Promise((r) => setTimeout(r, 1500));
    return stubRisk(march);
  }

  const context = getContext();
  const patientData = buildPatientContext(vitals, neuro, march, shootdownRisk);

  try {
    const result = await context.completion({
      messages: [
        { role: "system", content: RISK_SCORING_PROMPT },
        {
          role: "user",
          content: `/no_think\n\nAssess this patient and return JSON only:\n\n${patientData}`,
        },
      ],
      n_predict: 2048,
      temperature: TEMPERATURE,
      stop: getStopWords(),
    });

    const parsed = parseJSON(result.text);
    if (parsed?.level) {
      return {
        level: parsed.level,
        probability: parsed.probability ?? "",
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : [],
        bpAlert: parsed.bpAlert ?? null,
        loading: false,
        error: null,
        payloadItems: Array.isArray(parsed.payloadItems)
          ? parsed.payloadItems.map((item: any, i: number) => ({
              id: item.id ?? String(i + 1),
              name: item.name ?? "Unknown",
              included: item.included !== false,
            }))
          : stubRisk(march).payloadItems,
      };
    }

    console.warn(
      "assessRisk: could not parse model output, using stub. Raw:",
      result.text.slice(0, 200),
    );
    return stubRisk(march);
  } catch (e: any) {
    console.warn("assessRisk: inference error:", e?.message);
    return { ...stubRisk(march), error: e?.message ?? "Inference failed" };
  }
}

export async function extractFields(
  transcript: string,
  screenSchema: string,
): Promise<Record<string, any>> {
  if (!isModelLoaded()) return {};

  const context = getContext();
  try {
    const result = await context.completion({
      messages: [
        { role: "system", content: FIELD_EXTRACTION_PROMPT(screenSchema) },
        { role: "user", content: `/no_think\n\n${transcript}` },
      ],
      n_predict: 128,
      temperature: TEMPERATURE,
      stop: getStopWords(),
    });
    return parseJSON(result.text) ?? {};
  } catch (e: any) {
    console.warn("extractFields: error:", e?.message);
    return {};
  }
}

export async function askBuddy(
  message: string,
  context: string,
  onToken?: (token: string) => void,
): Promise<string> {
  if (!isModelLoaded()) {
    const stub = "AI model not loaded. Connect a model to use this feature.";
    if (onToken) onToken(stub);
    return stub;
  }

  const llmContext = getContext();
  try {
    const result = await llmContext.completion(
      {
        messages: [
          { role: "system", content: BUDDY_SYSTEM_PROMPT },
          {
            role: "user",
            content: `/no_think\n\nPatient context:\n${context}\n\nMedic: ${message}`,
          },
        ],
        n_predict: 512,
        temperature: 0,
        stop: getStopWords(),
      },
      onToken
        ? (data: { token: string }) => {
            onToken(data.token);
          }
        : undefined,
    );
    return stripThinking(result.text);
  } catch (e: any) {
    console.warn("askBuddy: error:", e?.message);
    return "AI assistant error: " + (e?.message ?? "unknown");
  }
}
