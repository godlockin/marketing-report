interface Env {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = params.id;
  try {
    const data = await request.json() as any;
    
    await env.DB.prepare(`
      UPDATE training_records SET 
        month=?, year=?, fiscal_year=?, hours=?, topic=?, description=?
      WHERE id=?
    `).bind(
      data.month, data.year, data.fiscalYear, 
      data.hours, data.topic, data.description, id
    ).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  try {
    await env.DB.prepare('DELETE FROM training_records WHERE id=?').bind(params.id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
