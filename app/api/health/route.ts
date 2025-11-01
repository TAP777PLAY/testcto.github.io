import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    redis?: 'up' | 'down';
  };
  version: string;
}

export async function GET() {
  const startTime = Date.now();
  const services: HealthCheckResponse['services'] = {
    database: 'down',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = 'up';
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const isHealthy = services.database === 'up';
  const responseTime = Date.now() - startTime;

  const response: HealthCheckResponse = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services,
    version: process.env.npm_package_version || '0.1.0',
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Response-Time': `${responseTime}ms`,
    },
  });
}
