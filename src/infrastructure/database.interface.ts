/**
 * Database client interface
 * Abstracts database operations for better testability and separation of concerns
 */

import { Result } from '../shared/result';

/**
 * Database query options
 */
export interface QueryOptions {
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Database error interface
 */
export interface DatabaseError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Interface for database operations
 * Provides a layer of abstraction over the database client
 */
export interface IDatabaseClient {
  /**
   * Query multiple records from a table
   */
  query<T>(table: string, options?: QueryOptions): Promise<Result<T[], DatabaseError>>;

  /**
   * Query a single record from a table
   */
  queryOne<T>(
    table: string,
    filters: Record<string, unknown>,
    select?: string
  ): Promise<Result<T | null, DatabaseError>>;

  /**
   * Insert one or more records into a table
   */
  insert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    returning?: string
  ): Promise<Result<T[], DatabaseError>>;

  /**
   * Update a record in a table
   */
  update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    returning?: string
  ): Promise<Result<T, DatabaseError>>;

  /**
   * Upsert records into a table
   */
  upsert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options?: { onConflict?: string; returning?: string }
  ): Promise<Result<T[], DatabaseError>>;

  /**
   * Delete records from a table
   */
  delete(table: string, filters: Record<string, unknown>): Promise<Result<void, DatabaseError>>;

  /**
   * Call a database function
   */
  rpc<T>(functionName: string, params?: Record<string, unknown>): Promise<Result<T, DatabaseError>>;
}
