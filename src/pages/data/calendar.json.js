import { getCollection } from 'astro:content';

// Calendario estático para las islas: semestres y cursos con sus horarios.
export async function GET() {
  const terms = await getCollection('terms');
  const courses = await getCollection('courses');
  const body = {
    terms: terms.map(t => t.data),
    courses: courses.map(c => ({ id: c.id, ...c.data })),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
