import { getCollection } from 'astro:content';

// Un solo modelo de ítem para juegos y flashcards: términos del glosario y casos.
export async function GET() {
  const glossary = await getCollection('glossary');
  const briefs = await getCollection('briefs');
  const items = [];
  for (const g of glossary) {
    if (!g.data.autoCard) continue;
    items.push({
      id: `term:${g.id}`, type: 'term', subject: g.data.subject, topic: g.data.topic || null,
      front: g.data.term, back: g.data.en.definition, es: g.data.es.explanation, esTerm: g.data.es.term || null,
      falseFriend: g.data.es.falseFriend || null, register: g.data.register, difficulty: g.data.difficulty,
      href: `/glossary/${g.id}/`,
    });
  }
  for (const b of briefs) {
    items.push({
      id: `case:${b.id}`, type: 'case', subject: b.data.course, topic: b.data.topic || null,
      front: `${b.data.title} (${b.data.year})`, back: b.data.oneLiner.en, es: b.data.oneLiner.es || null,
      hook: b.data.hook, rule: b.data.rule, difficulty: 2, status: b.data.status,
      href: `/briefs/${b.id}/`,
    });
  }
  return new Response(JSON.stringify({ generated: new Date().toISOString().slice(0, 10), items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
