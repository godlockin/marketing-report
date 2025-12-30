interface Env {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = params.id;
  
  try {
    const data = await request.json() as any;
    
    await env.DB.prepare(`
      UPDATE projects SET 
        title=?, type=?, status=?, owner=?, month=?, year=?, fiscal_year=?, 
        start_date=?, end_date=?, hours_invested=?, team_size=?, category=?, 
        metric=?, description=?
      WHERE id=?
    `).bind(
      data.title, data.type, data.status, data.owner, 
      data.month, data.year, data.fiscalYear, 
      data.startDate, data.endDate, data.hoursInvested, data.teamSize, 
      data.category, JSON.stringify(data.metric), data.description, id
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
    await env.DB.prepare('DELETE FROM projects WHERE id=?').bind(params.id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
