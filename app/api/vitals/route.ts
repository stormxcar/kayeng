export async function POST(request: Request) {
  try {
    const metric = await request.json();
    console.info("KAYENG_WEB_VITAL", metric);
  } catch {
    return new Response(null, { status: 400 });
  }
  return new Response(null, { status: 204 });
}
