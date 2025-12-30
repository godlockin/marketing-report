interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM training_records ORDER BY created_at DESC').all();
    
    const records = results.map((row: any) => ({
      id: row.id,
      month: row.month,
      year: row.year,
      fiscalYear: row.fiscal_year,
      hours: row.hours,
      topic: row.topic,
      description: row.description,
    }));

    return new Response(JSON.stringify(records), {
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
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO training_records (id, month, year, fiscal_year, hours, topic, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.month, data.year, data.fiscalYear, 
      data.hours, data.topic, data.description, now
    ).run();
    
    const newRecord = { ...data, id };
    
    return new Response(JSON.stringify(newRecord), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
