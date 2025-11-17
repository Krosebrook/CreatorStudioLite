import { supabase } from '../lib/supabase';
import { ApiError, ApiResponse } from '../types/common.types';

export class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async query<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    try {
      let query = supabase
        .from(table)
        .select(options.select || '*');

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw this.handleError(error);
      }

      return (data as T[]) || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async queryOne<T>(
    table: string,
    filters: Record<string, any>,
    select?: string
  ): Promise<T | null> {
    try {
      let query = supabase
        .from(table)
        .select(select || '*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw this.handleError(error);
      }

      return data as T | null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async insert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options: { returning?: string } = {}
  ): Promise<T[]> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data as any)
        .select(options.returning || '*');

      if (error) {
        throw this.handleError(error);
      }

      return (result as T[]) || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    options: { returning?: string } = {}
  ): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data as any)
        .eq('id', id)
        .select(options.returning || '*')
        .single();

      if (error) {
        throw this.handleError(error);
      }

      return result as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async upsert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options: { onConflict?: string; returning?: string } = {}
  ): Promise<T[]> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .upsert(data as any, options.onConflict ? { onConflict: options.onConflict } : undefined)
        .select(options.returning || '*');

      if (error) {
        throw this.handleError(error);
      }

      return (result as T[]) || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(
    table: string,
    filters: Record<string, any>
  ): Promise<void> {
    try {
      let query = supabase.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { error } = await query;

      if (error) {
        throw this.handleError(error);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rpc<T>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const { data, error } = await supabase
        .rpc(functionName, params);

      if (error) {
        throw this.handleError(error);
      }

      return data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (error instanceof Error) {
      return {
        code: 'API_ERROR',
        message: error.message,
        details: { originalError: error }
      };
    }

    if (error && typeof error === 'object') {
      return {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error.details || {}
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: { error }
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
