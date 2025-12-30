interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM annual_goals').all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const goals = await request.json() as any[];
    
    // Transaction: Delete all and re-insert (simplest for full list update)
    // Or upsert. Let's use upsert loop.
    
    const stmt = env.DB.prepare(`
      INSERT INTO annual_goals (id, name, value, description, progress, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, value=excluded.value, description=excluded.description, progress=excluded.progress
    `);
    
    const batch = goals.map(g => stmt.bind(
      g.id || crypto.randomUUID(), 
      g.name, g.value, g.description, g.progress, 
      new Date().toISOString()
    ));
    
    await env.DB.batch(batch);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
