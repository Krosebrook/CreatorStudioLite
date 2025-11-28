/**
 * Infrastructure layer exports
 * Provides interfaces and implementations for external services
 */

export type {
  IDatabaseClient,
  QueryOptions,
  DatabaseError,
} from './database.interface';

export { SupabaseDatabaseClient, databaseClient } from './supabase.client';
