import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export abstract class BaseService {
  protected supabase = supabase;
  protected logger = logger;

  protected handleError(error: any, context: string): never {
    const errorMessage = error?.message || 'Unknown error occurred';
    this.logger.error(`${context}: ${errorMessage}`, error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(errorMessage, 'SERVICE_ERROR', { context });
  }

  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    errorContext: string
  ): Promise<T> {
    try {
      if (!this.supabase) {
        throw new AppError('Database not configured', 'DB_NOT_CONFIGURED');
      }

      const { data, error } = await queryFn();

      if (error) {
        this.handleError(error, errorContext);
      }

      if (data === null) {
        throw new AppError('No data returned', 'NO_DATA', { context: errorContext });
      }

      return data;
    } catch (error) {
      this.handleError(error, errorContext);
    }
  }

  protected async executeCommand(
    commandFn: () => Promise<{ error: any }>,
    errorContext: string
  ): Promise<void> {
    try {
      if (!this.supabase) {
        throw new AppError('Database not configured', 'DB_NOT_CONFIGURED');
      }

      const { error } = await commandFn();

      if (error) {
        this.handleError(error, errorContext);
      }
    } catch (error) {
      this.handleError(error, errorContext);
    }
  }
}
