interface Env {
  ADMIN_PASSWORD?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { password } = await request.json() as { password?: string };
    
    // Default password if not set in environment variables
    const validPassword = env.ADMIN_PASSWORD || 'admin123';
    
    if (password === validPassword) {
      // Generate a simple token (in production use JWT signed with secret)
      // Here we just return a dummy token that the client stores
      // The client will send this token in Authorization header
      // Real apps should verify this token on every request
      const token = btoa(`admin:${Date.now()}`); // Simple base64 token
      
      return new Response(JSON.stringify({ token }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response('Unauthorized', { status: 401 });
    }
  } catch (e) {
    return new Response('Bad Request', { status: 400 });
  }
}
