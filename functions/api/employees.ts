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
    
    // Full sync: Delete all and re-insert
    const stmts = [];
    stmts.push(env.DB.prepare('DELETE FROM employees'));

    if (employees && employees.length > 0) {
      const insertStmt = env.DB.prepare(`
        INSERT INTO employees (id, name, role, avatar, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const e of employees) {
        stmts.push(insertStmt.bind(
          e.id || crypto.randomUUID(), 
          e.name || '', 
          e.role || '', 
          e.avatar || null, 
          new Date().toISOString()
        ));
      }
    }
    
    await env.DB.batch(stmts);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), { status: 400 });
    }
    
    await env.DB.prepare('DELETE FROM employees WHERE id = ?').bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
