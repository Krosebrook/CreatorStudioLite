import { createClient } from '@supabase/supabase-js';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
  timestamp: Date;
}

async function checkSupabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return {
        service: 'supabase',
        status: 'unhealthy',
        message: 'Supabase credentials not configured',
        timestamp: new Date()
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('user_profiles').select('count').limit(1);

    const responseTime = Date.now() - start;

    if (error) {
      return {
        service: 'supabase',
        status: 'unhealthy',
        message: error.message,
        responseTime,
        timestamp: new Date()
      };
    }

    return {
      service: 'supabase',
      status: 'healthy',
      responseTime,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      service: 'supabase',
      status: 'unhealthy',
      message: (error as Error).message,
      responseTime: Date.now() - start,
      timestamp: new Date()
    };
  }
}

async function checkEnvironment(): Promise<HealthCheckResult> {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      service: 'environment',
      status: 'unhealthy',
      message: `Missing required environment variables: ${missing.join(', ')}`,
      timestamp: new Date()
    };
  }

  return {
    service: 'environment',
    status: 'healthy',
    timestamp: new Date()
  };
}

async function runHealthCheck(): Promise<void> {
  console.log('🏥 Running health check...\n');

  const checks = [
    checkEnvironment(),
    checkSupabase()
  ];

  const results = await Promise.all(checks);

  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : '❌';
    const responseTime = result.responseTime ? ` (${result.responseTime}ms)` : '';

    console.log(`${icon} ${result.service}: ${result.status}${responseTime}`);

    if (result.message) {
      console.log(`   └─ ${result.message}`);
    }
  });

  const allHealthy = results.every(r => r.status === 'healthy');
  const someUnhealthy = results.some(r => r.status === 'unhealthy');

  console.log('\n' + '─'.repeat(50));

  if (allHealthy) {
    console.log('✅ All systems operational');
    process.exit(0);
  } else if (someUnhealthy) {
    console.log('❌ System health check failed');
    process.exit(1);
  } else {
    console.log('⚠️  System degraded but operational');
    process.exit(0);
  }
}

runHealthCheck().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});
