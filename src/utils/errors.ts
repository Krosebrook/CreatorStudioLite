export enum ErrorCode {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTOR_ERROR = 'CONNECTOR_ERROR',
  JOB_ERROR = 'JOB_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized', context?: Record<string, unknown>) {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403, true, context);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404, true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT, 409, true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, unknown>) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, true, context);
  }
}

export class ConnectorError extends AppError {
  constructor(message: string, connectorId?: string, context?: Record<string, unknown>) {
    super(
      message,
      ErrorCode.CONNECTOR_ERROR,
      500,
      true,
      { ...context, connectorId }
    );
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(
      `${service}: ${message}`,
      ErrorCode.EXTERNAL_API_ERROR,
      502,
      true,
      { ...context, service }
    );
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorResponse(error: unknown): {
  code: ErrorCode;
  message: string;
  statusCode: number;
  context?: Record<string, unknown>;
} {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      context: error.context
    };
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: error.message,
      statusCode: 500
    };
  }

  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
    statusCode: 500
  };
}
