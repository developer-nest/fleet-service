// src/common/date.utils.ts
import { RpcException } from '@nestjs/microservices';
import { status as statusError } from '@grpc/grpc-js';

/**
 * Convierte un string (o undefined/null) a Date.
 * Lanza RpcException si el string no es una fecha válida.
 * Devuelve null si el valor es undefined/null (para campos opcionales).
 */
export function toDateOrNull(value?: string | null): Date | null {
  if (!value) return null;

  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) {
    throw new RpcException({
      message: `Fecha inválida: "${value}" (usa formato YYYY-MM-DD)`,
      code: statusError.INVALID_ARGUMENT,
    });
  }

  return parsed;
}

/**
 * Igual que toDateOrNull, pero para campos OBLIGATORIOS (nunca debería ser null).
 * Úsalo cuando el campo no es opcional en tu interfaz (ej: TransportRequest.date).
 */
export function toDateRequired(value: string, fieldName = 'fecha'): Date {
  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) {
    throw new RpcException({
      message: `El campo "${fieldName}" tiene un valor de fecha inválido: "${value}"`,
      code: statusError.INVALID_ARGUMENT,
    });
  }

  return parsed;
}

/**
 * Convierte un Date (o undefined/null) a string ISO.
 * Útil al armar la respuesta que se manda por gRPC.
 */
export function toIsoStringOrUndefined(
  value?: Date | null,
): string | undefined {
  return value ? value.toISOString() : undefined;
}

/**
 * Igual, pero devuelve string vacío en vez de undefined
 * (útil si tu .proto no maneja "optional" y quieres evitar undefined).
 */
export function toIsoStringOrEmpty(value?: Date | null): string {
  return value ? value.toISOString() : '';
}

/**
 * Convierte solo la parte de HORA (para campos @db.Time() como startTime),
 * usando una fecha "dummy" ya que Prisma necesita un Date completo.
 */
export function toTimeDate(value: string): Date {
  return new Date(`1970-01-01T${value}`);
}
