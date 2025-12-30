interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM employees').all();
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
    const employees = await request.json() as any[];
    
    // Batch upsert
    const stmt = env.DB.prepare(`
      INSERT INTO employees (id, name, role, avatar, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, role=excluded.role, avatar=excluded.avatar
    `);
    
    const batch = employees.map(e => stmt.bind(
      e.id || crypto.randomUUID(), 
      e.name, e.role, e.avatar, 
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
