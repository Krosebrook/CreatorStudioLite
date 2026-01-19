/**
 * Standard error codes used throughout the application.
 * These codes provide consistent error identification across services.
 */
export enum ErrorCode {
  /** Authentication failure (e.g., invalid credentials) */
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  /** Authorization/permission denied */
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  /** Input validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Requested resource not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Resource conflict (e.g., duplicate entry) */
  CONFLICT = 'CONFLICT',
  /** API rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** External API call failed */
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  /** Database operation failed */
  DATABASE_ERROR = 'DATABASE_ERROR',
  /** Social media connector error */
  CONNECTOR_ERROR = 'CONNECTOR_ERROR',
  /** Background job execution error */
  JOB_ERROR = 'JOB_ERROR',
  /** Unexpected internal error */
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Base application error class with enhanced metadata.
 * 
 * Extends the native Error class with additional fields for better error handling,
 * including error codes, HTTP status codes, operational flags, and contextual data.
 * 
 * @example
 * ```typescript
 * throw new AppError(
 *   'Failed to process payment',
 *   ErrorCode.EXTERNAL_API_ERROR,
 *   502,
 *   true,
 *   { paymentId: 'pm_123', amount: 9.99 }
 * );
 * ```
 * 
 * @class
 * @extends Error
 * @since 1.0.0
 */
export class AppError extends Error {
  /** Standard error code for categorization */
  public readonly code: ErrorCode;
  /** HTTP status code to return */
  public readonly statusCode: number;
  /** Whether this is an expected operational error vs programming error */
  public readonly isOperational: boolean;
  /** Additional error context for debugging */
  public readonly context?: Record<string, unknown>;

  /**
   * Creates a new AppError instance.
   * 
   * @param message - Human-readable error message
   * @param [code=INTERNAL_ERROR] - Error code from ErrorCode enum
   * @param [statusCode=500] - HTTP status code
   * @param [isOperational=true] - Whether this is an operational error
   * @param [context] - Additional context data
   */
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

/**
 * Authentication error - thrown when user authentication fails.
 * HTTP Status: 401 Unauthorized
 * 
 * @example
 * ```typescript
 * if (!isValidToken(token)) {
 *   throw new AuthenticationError('Invalid or expired token');
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401, true, context);
  }
}

/**
 * Authorization error - thrown when user lacks required permissions.
 * HTTP Status: 403 Forbidden
 * 
 * @example
 * ```typescript
 * if (!user.hasPermission('delete:content')) {
 *   throw new AuthorizationError('User cannot delete content');
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized', context?: Record<string, unknown>) {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403, true, context);
  }
}

/**
 * Validation error - thrown when input validation fails.
 * HTTP Status: 400 Bad Request
 * 
 * @example
 * ```typescript
 * if (!email.includes('@')) {
 *   throw new ValidationError('Invalid email format', { email });
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
  }
}

/**
 * Not found error - thrown when a requested resource doesn't exist.
 * HTTP Status: 404 Not Found
 * 
 * @example
 * ```typescript
 * const user = await findUser(userId);
 * if (!user) {
 *   throw new NotFoundError('User', { userId });
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404, true, context);
  }
}

/**
 * Conflict error - thrown when a resource conflict occurs.
 * HTTP Status: 409 Conflict
 * 
 * @example
 * ```typescript
 * if (await userExists(email)) {
 *   throw new ConflictError('User with this email already exists', { email });
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT, 409, true, context);
  }
}

/**
 * Rate limit error - thrown when API rate limit is exceeded.
 * HTTP Status: 429 Too Many Requests
 * 
 * @example
 * ```typescript
 * if (requestCount > limit) {
 *   throw new RateLimitError('API rate limit exceeded', {
 *     limit,
 *     requestCount,
 *     resetTime
 *   });
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, unknown>) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, true, context);
  }
}

/**
 * Connector error - thrown when social media connector operations fail.
 * HTTP Status: 500 Internal Server Error
 * 
 * @example
 * ```typescript
 * try {
 *   await instagramApi.post(content);
 * } catch (error) {
 *   throw new ConnectorError('Failed to post to Instagram', 'instagram-123');
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
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

/**
 * External API error - thrown when calls to external services fail.
 * HTTP Status: 502 Bad Gateway
 * 
 * @example
 * ```typescript
 * try {
 *   await stripeApi.createCharge(params);
 * } catch (error) {
 *   throw new ExternalAPIError('Stripe', 'Payment processing failed', {
 *     chargeId: 'ch_123'
 *   });
 * }
 * ```
 * 
 * @class
 * @extends AppError
 */
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

/**
 * Type guard to check if an error is an AppError instance.
 * 
 * @param error - The error to check
 * @returns True if error is an AppError
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   if (isAppError(error)) {
 *     console.log('Error code:', error.code);
 *     console.log('Status:', error.statusCode);
 *   }
 * }
 * ```
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Converts any error into a standardized error response format.
 * 
 * Takes any error type and returns a consistent error response object
 * suitable for API responses or error handling middleware.
 * 
 * @param error - Any error object or value
 * @returns Standardized error response
 * 
 * @example
 * ```typescript
 * app.use((error, req, res, next) => {
 *   const errorResponse = getErrorResponse(error);
 *   res.status(errorResponse.statusCode).json(errorResponse);
 * });
 * ```
 */
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
