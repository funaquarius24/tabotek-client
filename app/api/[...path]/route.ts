const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handler(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.search;
  const backendPath = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const body = request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined;

  const response = await fetch(backendPath, {
    method: request.method,
    headers,
    body,
  });

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
