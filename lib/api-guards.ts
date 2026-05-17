import { NextResponse } from "next/server";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const defaultMaxJsonBytes = 64 * 1024;

export async function readJsonBody(request: Request, maxBytes = defaultMaxJsonBytes): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApiRequestError("Слишком большой JSON payload для demo API.", 413);
  }

  const text = await request.text();
  if (!text.trim()) return {};

  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength > maxBytes) {
    throw new ApiRequestError("Слишком большой JSON payload для demo API.", 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiRequestError("Некорректный JSON payload.", 400);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiRequestError("JSON payload должен быть объектом.", 400);
  }

  return parsed as Record<string, unknown>;
}

export function apiErrorStatus(error: unknown, fallbackStatus = 400) {
  return error instanceof ApiRequestError ? error.status : fallbackStatus;
}

export function apiErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function apiErrorResponse(error: unknown, fallbackMessage: string, fallbackStatus = 400) {
  return NextResponse.json(
    { error: apiErrorMessage(error, fallbackMessage) },
    { status: apiErrorStatus(error, fallbackStatus) }
  );
}

export function getSafeQueryLimit(
  request: Request,
  options: { defaultLimit?: number; maxLimit?: number } = {}
) {
  const defaultLimit = options.defaultLimit ?? 100;
  const maxLimit = options.maxLimit ?? 500;
  const rawLimit = new URL(request.url).searchParams.get("limit");
  const parsed = rawLimit ? Number(rawLimit) : defaultLimit;

  if (!Number.isFinite(parsed) || parsed <= 0) return defaultLimit;
  return Math.min(Math.floor(parsed), maxLimit);
}

export function getOptionalQueryString(request: Request, key: string) {
  const value = new URL(request.url).searchParams.get(key)?.trim();
  return value || undefined;
}
