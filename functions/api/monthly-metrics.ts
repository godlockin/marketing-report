interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM monthly_metrics').all();
    
    // Map snake_case to camelCase
    const metrics = results.map((row: any) => ({
      id: row.id,
      month: row.month,
      year: row.year,
      fiscalYear: row.fiscal_year,
      conversionRate: row.conversion_rate,
      highlights: row.highlights,
      lessons: row.lessons,
      improvements: row.improvements,
    }));

    return new Response(JSON.stringify(metrics), {
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
    
    // Check if exists
    const existing = await env.DB.prepare('SELECT id FROM monthly_metrics WHERE month=? AND year=? AND fiscal_year=?')
      .bind(data.month, data.year, data.fiscalYear).first();
      
    if (existing) {
      // Update
      await env.DB.prepare(`
        UPDATE monthly_metrics SET conversion_rate=?, highlights=?, lessons=?, improvements=?
        WHERE id=?
      `).bind(data.conversionRate, data.highlights, data.lessons, data.improvements, existing.id).run();
    } else {
      // Insert
      const id = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO monthly_metrics (id, month, year, fiscal_year, conversion_rate, highlights, lessons, improvements, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, data.month, data.year, data.fiscalYear, 
        data.conversionRate, data.highlights, data.lessons, data.improvements, 
        new Date().toISOString()
      ).run();
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
