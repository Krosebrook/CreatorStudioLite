/**
 * Supabase implementation of the database client interface
 */

import { supabase } from '../lib/supabase';
import { success, failure, Result } from '../shared/result';
import {
  IDatabaseClient,
  QueryOptions,
  DatabaseError,
} from './database.interface';

/**
 * Creates a database error from a Supabase error
 */
function createDatabaseError(error: unknown): DatabaseError {
  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string; details?: unknown };
    return {
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message || 'An unknown database error occurred',
      details: err.details,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
  };
}

/**
 * Supabase database client implementation
 */
export class SupabaseDatabaseClient implements IDatabaseClient {
  private static instance: SupabaseDatabaseClient;

  private constructor() {}

  static getInstance(): SupabaseDatabaseClient {
    if (!SupabaseDatabaseClient.instance) {
      SupabaseDatabaseClient.instance = new SupabaseDatabaseClient();
    }
    return SupabaseDatabaseClient.instance;
  }

  async query<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<Result<T[], DatabaseError>> {
    try {
      let query = supabase.from(table).select(options.select || '*');

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success((data as T[]) || []);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }

  async queryOne<T>(
    table: string,
    filters: Record<string, unknown>,
    select?: string
  ): Promise<Result<T | null, DatabaseError>> {
    try {
      let query = supabase.from(table).select(select || '*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.maybeSingle();

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success(data as T | null);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }

  async insert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    returning?: string
  ): Promise<Result<T[], DatabaseError>> {
    try {
      // Type assertion needed: Supabase expects Record<string, unknown> but we have Partial<T>
      // This is a safe boundary conversion since Partial<T> is compatible with Record<string, unknown>
      const { data: result, error } = await supabase
        .from(table)
        .insert(data as Record<string, unknown>)
        .select(returning || '*');

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success((result as T[]) || []);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }

  async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    returning?: string
  ): Promise<Result<T, DatabaseError>> {
    try {
      // Type assertion needed: Supabase expects Record<string, unknown> but we have Partial<T>
      // This is a safe boundary conversion since Partial<T> is compatible with Record<string, unknown>
      const { data: result, error } = await supabase
        .from(table)
        .update(data as Record<string, unknown>)
        .eq('id', id)
        .select(returning || '*')
        .single();

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success(result as T);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }

  async upsert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options?: { onConflict?: string; returning?: string }
  ): Promise<Result<T[], DatabaseError>> {
    try {
      // Type assertion needed: Supabase expects Record<string, unknown> but we have Partial<T>
      // This is a safe boundary conversion since Partial<T> is compatible with Record<string, unknown>
      const { data: result, error } = await supabase
        .from(table)
        .upsert(
          data as Record<string, unknown>,
          options?.onConflict ? { onConflict: options.onConflict } : undefined
        )
        .select(options?.returning || '*');

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success((result as T[]) || []);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }

  async delete(
    table: string,
    filters: Record<string, unknown>
  ): Promise<Result<void, DatabaseError>> {
    try {
      let query = supabase.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { error } = await query;

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success(undefined);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }

  async rpc<T>(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<Result<T, DatabaseError>> {
    try {
      const { data, error } = await supabase.rpc(functionName, params);

      if (error) {
        return failure(createDatabaseError(error));
      }

      return success(data as T);
    } catch (error) {
      return failure(createDatabaseError(error));
    }
  }
}

export const databaseClient = SupabaseDatabaseClient.getInstance();
