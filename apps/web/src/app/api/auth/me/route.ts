import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashToken } from '../../../../lib/security';
import { ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

    if (!rawToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const tokenHash = hashToken(rawToken);

    const session = await prisma.session.findFirst({
      where: {
        token_hash: tokenHash,
        expires_at: { gt: new Date() }
      },
      include: {
        user: {
          include: { farm: true }
        }
      }
    });

    if (!session || !session.user || !session.user.is_active) {
      return NextResponse.json(
        { success: false, error: { message: 'Session expired or invalid' } },
        { status: 401 }
      );
    }

    const user = session.user;
    const permissions = ROLE_DEFAULT_PERMISSIONS[user.role_name] || [];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          farmId: user.farm_id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          roleName: user.role_name,
          phone: user.phone,
          permissions
        },
        farm: user.farm
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
