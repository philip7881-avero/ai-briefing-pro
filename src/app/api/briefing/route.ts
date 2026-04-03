import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const maxDuration = 60;

function tryParseJSON(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    // noop
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // noop
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { industry, interests } = await req.json();

    const prompt = `Genera un briefing de IA para un dueño de negocio en Chile, sector: "${industry}". Intereses: ${interests.join(", ")}.

PÚBLICO: Dueño de empresa, NO técnico. Lenguaje simple. Oportunidades que NO requieran programar.

IMPORTANTE: Responde SOLO con JSON válido. Sin markdown, sin backticks, sin texto antes ni después del JSON. Solo el objeto JSON puro.

El JSON debe tener esta estructura exacta:
{"radar":[{"title":"","highlight":"","description":"","whyItMatters":"","impact":5,"status":"disponible","sourceUrl":"","sourceName":""}],"prompts":[{"title":"","category":"","prompt":"","explanation":""}],"opportunities":[{"title":"","market":"","play":"","pricing":""}],"strategy":[{"period":"Días 1-30","title":"","actions":["","",""]}]}

REGLAS:
- radar: 4 items. impact 1-5. status: disponible|beta|próximamente. sourceUrl con URLs reales.
- prompts: 4 items para ${industry}. Prompts copiables para ChatGPT/Claude con [placeholders].
- opportunities: 3 ideas SIN programar para ${industry} en Chile. Cifras en CLP.
- strategy: 3 fases (Días 1-30, Días 31-60, Días 61-90), 3 acciones cortas cada una.
- Todo en español. Fecha: ${new Date().toLocaleDateString("es-CL")}
- Sé CONCISO en las descripciones (1-2 frases máximo por campo). Esto es crítico para que el JSON no se corte.`;

    let lastError = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await generateText({
          model: anthropic("claude-haiku-4-5-20251001"),
          prompt,
          maxOutputTokens: 4096,
        });

        const json = tryParseJSON(result.text);
        if (json && json.radar && json.prompts && json.opportunities && json.strategy) {
          return Response.json(json);
        }
        lastError = "JSON incompleto o sin las claves esperadas";
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Error desconocido en la API";
      }
    }

    return Response.json(
      { error: "No se pudo generar el briefing después de 2 intentos. " + lastError },
      { status: 500 }
    );
  } catch (e) {
    return Response.json(
      { error: "Error interno: " + (e instanceof Error ? e.message : "desconocido") },
      { status: 500 }
    );
  }
}
