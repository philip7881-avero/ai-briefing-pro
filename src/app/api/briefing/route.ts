import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { industry, interests } = await req.json();

  const prompt = `Genera un briefing completo de inteligencia artificial para un ejecutivo/dueño de empresa en Chile, sector: "${industry}".
Sus intereses son: ${interests.join(", ")}.

Fecha actual: ${new Date().toLocaleDateString("es-CL")}. TODA la información debe ser real y actualizada a 2026.

Responde EXCLUSIVAMENTE con un JSON válido (sin markdown, sin backticks, sin texto fuera del JSON) con esta estructura exacta:

{
  "radar": [
    {
      "title": "Nombre del avance",
      "highlight": "Resumen de una línea con dato clave",
      "description": "Explicación de 2-3 líneas de qué es y cómo funciona",
      "whyItMatters": "Por qué le importa específicamente a alguien en ${industry}",
      "impact": 5,
      "status": "disponible",
      "sourceUrl": "URL real de la fuente",
      "sourceName": "Nombre de la fuente"
    }
  ],
  "prompts": [
    {
      "title": "Nombre del prompt",
      "category": "Categoría",
      "prompt": "El prompt completo listo para copiar, adaptado a ${industry}",
      "explanation": "Para qué sirve y cuándo usarlo"
    }
  ],
  "opportunities": [
    {
      "title": "Nombre de la oportunidad",
      "market": "Descripción del mercado y tamaño",
      "play": "Qué hacer concretamente",
      "pricing": "Modelo de pricing sugerido con cifras en CLP o USD"
    }
  ],
  "strategy": [
    {
      "period": "Días 1-30",
      "title": "Nombre de la fase",
      "actions": ["Acción 1", "Acción 2", "Acción 3", "Acción 4"]
    }
  ]
}

REGLAS ESTRICTAS:
- radar: exactamente 8 items, ordenados por impacto
- prompts: exactamente 10 items, los más útiles para ${industry}
- opportunities: exactamente 5 items específicas para ${industry} en Chile
- strategy: exactamente 3 items (30/60/90 días)
- impact: número del 1 al 5
- status: "disponible" | "beta" | "próximamente"
- Todos los prompts deben incluir placeholders con [corchetes] para personalizar
- Todo en español
- Las fuentes (sourceUrl) deben ser URLs reales y verificables
- NO inventes URLs — usa fuentes conocidas como sitios de noticias tech, blogs oficiales, etc.`;

  const result = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    prompt,
    maxOutputTokens: 4000,
  });

  try {
    const json = JSON.parse(result.text);
    return Response.json(json);
  } catch {
    // Try to extract JSON from the response if wrapped in markdown
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
