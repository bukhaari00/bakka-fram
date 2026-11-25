import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyPassword, generateToken, hashToken } from '../../../../lib/security';
import { ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, email, username, password, rememberMe } = body;
    const loginId = (identifier || email || username || '').toLowerCase().trim();

    if (!loginId) {
      return NextResponse.json(
        { success: false, error: { message: 'Email or username is required.' } },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: { message: 'Password is required.' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { username: loginId }
        ]
      },
      include: { farm: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid email/username or password.' } },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: { message: 'Account is deactivated. Please contact an administrator.' } },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(user.password_hash, password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid email/username or password.' } },
        { status: 401 }
      );
    }

    const sessionDays = rememberMe ? 30 : 7;
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * sessionDays);

    await prisma.session.create({
      data: {
        id: uuidv4(),
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: req.headers.get('x-forwarded-for') || null,
        user_agent: req.headers.get('user-agent') || null
      }
    });

    const permissions = ROLE_DEFAULT_PERMISSIONS[user.role_name] || [];

    const response = NextResponse.json({
      success: true,
      data: {
        token: rawToken,
        expiresAt,
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

    response.cookies.set('bakka_token', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * sessionDays
    });

    return response;
  } catch (error: any) {
    console.error('[API Login Error]:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
