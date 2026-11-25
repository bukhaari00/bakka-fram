import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = 'disconnected';
  }

  return NextResponse.json({
    success: true,
    data: {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      database: dbStatus,
      system: 'Bakka Farm Next.js Native API',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    }
  });
}
