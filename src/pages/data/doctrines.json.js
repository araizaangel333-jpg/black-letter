import { getCollection } from 'astro:content';

// Checklists con sus elementos, para el Elements Builder. Se excluyen las etiquetas que se repiten
// en varias notas (p. ej. el contraste mexicano): pertenecen a cualquier doctrina y no discriminan.
export async function GET() {
  const notes = await getCollection('notes');
  const key = (e) => e.label.en.trim().toLowerCase();
  const count = {};
  for (const n of notes) for (const e of n.data.elements) count[key(e)] = (count[key(e)] || 0) + 1;
  const doctrines = [];
  for (const n of notes) {
    const els = n.data.elements.filter(e => count[key(e)] === 1);
    if (els.length < 3) continue;
    doctrines.push({
      id: n.id, subject: n.data.course, topic: n.data.topic || null,
      title: n.data.title.en, es: n.data.title.es || null, href: `/notes/${n.id}/`,
      elements: els.map(e => ({ id: e.id, label: e.label.en, es: e.label.es || null, test: e.test || null, authority: e.authority || null, pitfall: e.pitfall || null })),
    });
  }
  return new Response(JSON.stringify({ generated: new Date().toISOString().slice(0, 10), doctrines }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
