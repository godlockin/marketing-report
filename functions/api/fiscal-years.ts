interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM fiscal_years ORDER BY start_year DESC').all();
    
    const fiscalYears = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      startMonth: row.start_month,
      startYear: row.start_year,
    }));

    return new Response(JSON.stringify(fiscalYears), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const data = await request.json() as any;
    const id = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO fiscal_years (id, name, start_month, start_year)
      VALUES (?, ?, ?, ?)
    `).bind(id, data.name, data.startMonth, data.startYear).run();
    
    const newRecord = { ...data, id };
    
    return new Response(JSON.stringify(newRecord), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
