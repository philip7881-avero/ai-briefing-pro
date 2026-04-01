import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
    const { industry, interests } = await req.json();

  const prompt = `Genera un briefing de IA para un dueño de negocio en Chile, sector: "${industry}". Intereses: ${interests.join(", ")}.

  PÚBLICO: Dueño de empresa, NO técnico. Lenguaje simple. Oportunidades que NO requieran programar.

  Responde SOLO con JSON válido (sin markdown, sin backticks, sin texto extra):

  {"radar":[{"title":"","highlight":"","description":"","whyItMatters":"","impact":5,"status":"disponible","sourceUrl":"","sourceName":""}],"prompts":[{"title":"","category":"","prompt":"","explanation":""}],"opportunities":[{"title":"","market":"","play":"","pricing":""}],"strategy":[{"period":"Días 1-30","title":"","actions":["","",""]}]}

  CANTIDADES EXACTAS:
  - radar: 4 items. impact 1-5. status: disponible|beta|próximamente. URLs reales.
  - prompts: 4 items para ${industry}. Prompts copiables para ChatGPT/Claude con [placeholders].
  - opportunities: 3 ideas SIN programar para ${industry} en Chile. Cifras en CLP.
  - strategy: 3 fases (30/60/90 días), 3 acciones cortas cada una.
  - Todo en español. Fecha: ${new Date().toLocaleDateString("es-CL")}`;

  const result = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        prompt,
        maxOutputTokens: 2500,
  });

  try {
        const json = JSON.parse(result.text);
        return Response.json(json);
  } catch {
        const match = result.text.match(/\{[\s\S]*\}/);
        if (match) {
                try {
                          const json = JSON.parse(match[0]);
                          return Response.json(json);
                } catch {
                          return Response.json({ error: "Failed to parse response" }, { status: 500 });
                }
        }
        return Response.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
