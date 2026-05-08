const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handler(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.search;
  const backendPath = `${BACKEND_URL}${path}${search}`;

  const cookie = request.headers.get('cookie');
  console.log(`[API Proxy] ${request.method} ${path} | cookie=${cookie?.substring(0, 60)}`);

  const headers = new Headers(request.headers);
  headers.delete('host');

  const fetchOptions: RequestInit = { method: request.method, headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = await request.blob();
  }

  const response = await fetch(backendPath, fetchOptions);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.delete('transfer-encoding');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
