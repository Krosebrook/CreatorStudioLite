import { ApiError, ApiResponse, Result } from '../types/common.types';
import { databaseClient, IDatabaseClient, QueryOptions, DatabaseError } from '../infrastructure';
import { isSuccess } from '../shared/result';

/**
 * API Client that wraps database operations
 * Provides both promise-throwing methods (legacy) and Result-based methods (new)
 */
export class ApiClient {
  private static instance: ApiClient;
  private db: IDatabaseClient;

  private constructor(db: IDatabaseClient = databaseClient) {
    this.db = db;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Query with Result pattern (recommended for new code)
   */
  async querySafe<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<Result<T[], DatabaseError>> {
    return this.db.query<T>(table, options);
  }

  /**
   * Query (legacy - throws on error)
   */
  async query<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, unknown>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    const result = await this.db.query<T>(table, options);
    if (isSuccess(result)) {
      return result.data;
    }
    throw this.toApiError(result.error);
  }

  /**
   * Query one with Result pattern (recommended for new code)
   */
  async queryOneSafe<T>(
    table: string,
    filters: Record<string, unknown>,
    select?: string
  ): Promise<Result<T | null, DatabaseError>> {
    return this.db.queryOne<T>(table, filters, select);
  }

  /**
   * Query one (legacy - throws on error)
   */
  async queryOne<T>(
    table: string,
    filters: Record<string, unknown>,
    select?: string
  ): Promise<T | null> {
    const result = await this.db.queryOne<T>(table, filters, select);
    if (isSuccess(result)) {
      return result.data;
    }
    throw this.toApiError(result.error);
  }

  /**
   * Insert with Result pattern (recommended for new code)
   */
  async insertSafe<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    returning?: string
  ): Promise<Result<T[], DatabaseError>> {
    return this.db.insert<T>(table, data, returning);
  }

  /**
   * Insert (legacy - throws on error)
   */
  async insert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options: { returning?: string } = {}
  ): Promise<T[]> {
    const result = await this.db.insert<T>(table, data, options.returning);
    if (isSuccess(result)) {
      return result.data;
    }
    throw this.toApiError(result.error);
  }

  /**
   * Update with Result pattern (recommended for new code)
   */
  async updateSafe<T>(
    table: string,
    id: string,
    data: Partial<T>,
    returning?: string
  ): Promise<Result<T, DatabaseError>> {
    return this.db.update<T>(table, id, data, returning);
  }

  /**
   * Update (legacy - throws on error)
   */
  async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    options: { returning?: string } = {}
  ): Promise<T> {
    const result = await this.db.update<T>(table, id, data, options.returning);
    if (isSuccess(result)) {
      return result.data;
    }
    throw this.toApiError(result.error);
  }

  /**
   * Upsert with Result pattern (recommended for new code)
   */
  async upsertSafe<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options?: { onConflict?: string; returning?: string }
  ): Promise<Result<T[], DatabaseError>> {
    return this.db.upsert<T>(table, data, options);
  }

  /**
   * Upsert (legacy - throws on error)
   */
  async upsert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options: { onConflict?: string; returning?: string } = {}
  ): Promise<T[]> {
    const result = await this.db.upsert<T>(table, data, options);
    if (isSuccess(result)) {
      return result.data;
    }
    throw this.toApiError(result.error);
  }

  /**
   * Delete with Result pattern (recommended for new code)
   */
  async deleteSafe(
    table: string,
    filters: Record<string, unknown>
  ): Promise<Result<void, DatabaseError>> {
    return this.db.delete(table, filters);
  }

  /**
   * Delete (legacy - throws on error)
   */
  async delete(
    table: string,
    filters: Record<string, unknown>
  ): Promise<void> {
    const result = await this.db.delete(table, filters);
    if (isSuccess(result)) {
      return;
    }
    throw this.toApiError(result.error);
  }

  /**
   * RPC with Result pattern (recommended for new code)
   */
  async rpcSafe<T>(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<Result<T, DatabaseError>> {
    return this.db.rpc<T>(functionName, params);
  }

  /**
   * RPC (legacy - throws on error)
   */
  async rpc<T>(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const result = await this.db.rpc<T>(functionName, params);
    if (isSuccess(result)) {
      return result.data;
    }
    throw this.toApiError(result.error);
  }

  /**
   * Convert DatabaseError to ApiError
   */
  private toApiError(error: DatabaseError): ApiError {
    return {
      code: error.code,
      message: error.message,
      details: error.details as Record<string, unknown> | undefined,
    };
  }

  createResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }

  createErrorResponse(error: ApiError): ApiResponse<never> {
    return {
      success: false,
      error,
      timestamp: new Date().toISOString()
    };
  }
}

export const apiClient = ApiClient.getInstance();
