import { NextRequest, NextResponse } from "next/server";

type ApiHandler = (req: any, res: any) => unknown | Promise<unknown>;

type RouteContext = {
  params?: Record<string, string | string[]> | Promise<Record<string, string | string[]>>;
};

const readBody = async (request: NextRequest) => {
  if (request.method === "GET" || request.method === "HEAD") return undefined;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType) return undefined;

  try {
    if (contentType.includes("application/json")) return await request.json();
    return await request.text();
  } catch (error) {
    return undefined;
  }
};

const toHeadersObject = (headers: Headers) => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
};

export const runApiHandler = async (
  request: NextRequest,
  context: RouteContext,
  handler: ApiHandler,
) => {
  const url = new URL(request.url);
  const params = context.params ? await context.params : {};
  const query: Record<string, string | string[]> = { ...params };

  url.searchParams.forEach((value, key) => {
    if (query[key]) {
      const existing = query[key];
      query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      query[key] = value;
    }
  });

  let statusCode = 200;
  const responseHeaders = new Headers();
  let response: NextResponse | undefined;

  const res = {
    setHeader(name: string, value: string) {
      responseHeaders.set(name, value);
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      response = NextResponse.json(payload, {
        status: statusCode,
        headers: responseHeaders,
      });
      return response;
    },
    send(payload: BodyInit | null) {
      response = new NextResponse(payload, {
        status: statusCode,
        headers: responseHeaders,
      });
      return response;
    },
  };

  const req = {
    method: request.method,
    headers: toHeadersObject(request.headers),
    query,
    body: await readBody(request),
  };

  const result = await handler(req, res);
  if (response) return response;
  if (result instanceof NextResponse) return result;

  return new NextResponse(null, {
    status: statusCode === 200 ? 204 : statusCode,
    headers: responseHeaders,
  });
};
