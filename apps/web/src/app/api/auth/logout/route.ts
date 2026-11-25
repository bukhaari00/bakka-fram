import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashToken } from '../../../../lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let rawToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!rawToken) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/bakka_token=([^;]+)/);
        if (match) rawToken = match[1];
      }
    }

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.session.deleteMany({
        where: { token_hash: tokenHash }
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('bakka_token');
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: true });
  }
}
