import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, industry, interests } = await req.json();

  const systemPrompt = `Eres un consultor experto en inteligencia artificial aplicada a negocios en Chile y Latinoamérica.
El usuario trabaja en el sector: ${industry}.
Sus intereses principales son: ${interests?.join(", ") || "generales"}.

REGLAS:
- Responde SIEMPRE en español chileno profesional (cercano pero no informal)
- Sé concreto y práctico — nada de teoría abstracta
- Cuando recomiendes herramientas, menciona precios y disponibilidad real
- Adapta todo al contexto del mercado chileno
- Si te preguntan algo fuera de AI/tecnología, redirige amablemente
- Sé breve: máximo 3-4 párrafos por respuesta
- Cuando sea útil, estructura con viñetas
- Fecha actual: ${new Date().toLocaleDateString("es-CL")}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
