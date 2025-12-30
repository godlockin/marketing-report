interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    
    // Map snake_case to camelCase
    const projects = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      status: row.status,
      owner: row.owner,
      month: row.month,
      year: row.year,
      fiscalYear: row.fiscal_year,
      startDate: row.start_date,
      endDate: row.end_date,
      hoursInvested: row.hours_invested,
      teamSize: row.team_size,
      category: row.category,
      metric: typeof row.metric === 'string' ? JSON.parse(row.metric) : row.metric,
      description: row.description,
    }));

    return new Response(JSON.stringify(projects), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const project = await request.json() as any;
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO projects (id, title, type, status, owner, month, year, fiscal_year, start_date, end_date, hours_invested, team_size, category, metric, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, project.title, project.type, project.status, project.owner, 
      project.month, project.year, project.fiscalYear, 
      project.startDate, project.endDate, project.hoursInvested, project.teamSize, 
      project.category, JSON.stringify(project.metric), project.description, now
    ).run();
    
    const newProject = { ...project, id };
    
    return new Response(JSON.stringify(newProject), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
