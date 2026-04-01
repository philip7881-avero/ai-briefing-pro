import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { industry, interests } = await req.json();

  const prompt = `Genera un briefing completo de inteligencia artificial para un dueño de negocio o emprendedor en Chile, sector: "${industry}".
Sus intereses son: ${interests.join(", ")}.

IMPORTANTE SOBRE EL PÚBLICO:
- El usuario NO es programador ni técnico. Es un dueño de negocio, gerente o emprendedor de 35-60 años.
- Todo debe explicarse en lenguaje simple y directo, sin jerga técnica.
- Los prompts deben ser para usar en ChatGPT o Claude, copiando y pegando directamente.
- Las oportunidades deben ser cosas que esta persona PUEDA hacer desde su realidad: contratar un servicio, usar una herramienta no-code, aplicar IA a su negocio actual, ofrecer algo nuevo a sus clientes. NO oportunidades que requieran saber programar.
- La estrategia debe tener pasos concretos que alguien sin equipo técnico pueda ejecutar.

Fecha actual: ${new Date().toLocaleDateString("es-CL")}. TODA la información debe ser real y actualizada a 2026.

Responde EXCLUSIVAMENTE con un JSON válido (sin markdown, sin backticks, sin texto fuera del JSON) con esta estructura exacta:

{
  "radar": [
    {
      "title": "Nombre del avance (en español simple)",
      "highlight": "Resumen de una línea con dato clave",
      "description": "Explicación de 2-3 líneas de qué es y cómo funciona, en lenguaje para no-técnicos",
      "whyItMatters": "Por qué le importa a un dueño de negocio en ${industry} en Chile",
      "impact": 5,
      "status": "disponible",
      "sourceUrl": "URL real de la fuente",
      "sourceName": "Nombre de la fuente"
    }
  ],
  "prompts": [
    {
      "title": "Nombre descriptivo del prompt",
      "category": "Categoría (ej: Ventas, Marketing, Operaciones, Atención al Cliente, Finanzas)",
      "prompt": "El prompt completo listo para copiar y pegar en ChatGPT o Claude, adaptado a ${industry}. Debe ser claro y en español.",
      "explanation": "Para qué sirve y en qué situación usarlo — explicado de forma simple"
    }
  ],
  "opportunities": [
    {
      "title": "Nombre de la oportunidad de negocio",
      "market": "Descripción del mercado: qué necesidad existe y por qué ahora es el momento",
      "play": "Qué puede hacer concretamente un dueño de negocio SIN saber programar. Herramientas, servicios o acciones concretas.",
      "pricing": "Cuánto puede cobrar o cuánto puede ahorrar, con cifras realistas en CLP"
    }
  ],
  "strategy": [
    {
      "period": "Días 1-30",
      "title": "Nombre de la fase",
      "actions": ["Acción concreta 1 (que no requiera programar)", "Acción 2", "Acción 3", "Acción 4"]
    }
  ]
}

REGLAS ESTRICTAS:
- radar: exactamente 8 items, ordenados por impacto para un dueño de negocio
- prompts: exactamente 10 items, los más útiles para alguien en ${industry} que usa ChatGPT/Claude
- opportunities: exactamente 5 ideas de negocio o mejoras que alguien SIN conocimientos técnicos pueda implementar en ${industry} en Chile
- strategy: exactamente 3 items (30/60/90 días), con acciones ejecutables sin saber programar
- impact: número del 1 al 5
- status: "disponible" | "beta" | "próximamente"
- Todos los prompts deben incluir placeholders con [corchetes] para personalizar
- Todo en español chileno natural
- Las fuentes (sourceUrl) deben ser URLs reales y verificables
- NO inventes URLs — usa fuentes conocidas`;

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
