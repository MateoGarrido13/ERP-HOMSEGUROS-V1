/**
 * Cliente HTTP controlado por Circuit Breaker (prompt 08, ADR-003, ADR-009).
 *
 * Responsabilidades:
 * - Ejecutar POST/GET con `fetch` nativo respetando `AbortSignal`.
 * - Consultar `circuitBreaker.isOpen()` antes de hacer `fetch` (fail-fast).
 * - Notificar éxito/falla al circuit breaker tras cada respuesta.
 * - Nunca crear su propio `setTimeout` ni `AbortController` (el timeout vive en el Orquestador).
 * - Nunca instanciar el registry; recibe el CB inyectado por constructor.
 *
 * `headersOverride` permite ajustar cabeceras por llamada (ej. cambiar
 * Content-Type a x-www-form-urlencoded para endpoints de autenticación).
 */

import type { AppError, ICircuitBreaker } from "./types.ts";

export class HttpClient {
  private readonly baseUrl: string;
  private readonly circuitBreaker: ICircuitBreaker;

  constructor(baseUrl: string, circuitBreaker: ICircuitBreaker) {
    this.baseUrl = baseUrl;
    this.circuitBreaker = circuitBreaker;
  }

  async post<T>(
    path: string,
    body: unknown,
    signal: AbortSignal,
    headersOverride?: Record<string, string>
  ): Promise<T> {
    if (this.circuitBreaker.isOpen()) {
      this.circuitBreaker.recordFailure();
      throw new AppError(
        "CIRCUITO_ABIERTO",
        `Circuit breaker abierto para ${this.baseUrl}${path}`
      );
    }

    const headers: Record<string, string> = headersOverride ?? {
      "content-type": "application/json",
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers,
        signal,
      });
    } catch (err) {
      this.circuitBreaker.recordFailure();
      const esAbort = err instanceof Error && err.name === "AbortError";
      throw new AppError(
        esAbort ? "ABORTED" : "HTTP_PROVEEDOR",
        esAbort
          ? `Petición abortada: ${this.baseUrl}${path}`
          : `Error de red llamando a ${this.baseUrl}${path}`
      );
    }

    if (!response.ok) {
      this.circuitBreaker.recordFailure();
      throw new AppError(
        "HTTP_PROVEEDOR",
        `Proveedor respondió ${response.status} en ${this.baseUrl}${path}`
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      this.circuitBreaker.recordFailure();
      throw new AppError(
        "HTTP_PROVEEDOR",
        `Respuesta no parseable de ${this.baseUrl}${path}`
      );
    }

    this.circuitBreaker.recordSuccess();
    return data as T;
  }

  async get<T>(
    path: string,
    signal: AbortSignal,
    headersOverride?: Record<string, string>
  ): Promise<T> {
    if (this.circuitBreaker.isOpen()) {
      this.circuitBreaker.recordFailure();
      throw new AppError(
        "CIRCUITO_ABIERTO",
        `Circuit breaker abierto para ${this.baseUrl}${path}`
      );
    }

    const headers: Record<string, string> = headersOverride ?? {};

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers,
        signal,
      });
    } catch (err) {
      this.circuitBreaker.recordFailure();
      const esAbort = err instanceof Error && err.name === "AbortError";
      throw new AppError(
        esAbort ? "ABORTED" : "HTTP_PROVEEDOR",
        esAbort
          ? `Petición abortada: ${this.baseUrl}${path}`
          : `Error de red llamando a ${this.baseUrl}${path}`
      );
    }

    if (!response.ok) {
      this.circuitBreaker.recordFailure();
      throw new AppError(
        "HTTP_PROVEEDOR",
        `Proveedor respondió ${response.status} en ${this.baseUrl}${path}`
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      this.circuitBreaker.recordFailure();
      throw new AppError(
        "HTTP_PROVEEDOR",
        `Respuesta no parseable de ${this.baseUrl}${path}`
      );
    }

    this.circuitBreaker.recordSuccess();
    return data as T;
  }
}
