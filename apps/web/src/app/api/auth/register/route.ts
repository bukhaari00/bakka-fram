import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, generateToken, hashToken } from '../../../../lib/security';
import { ROLES, ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, username, phone, password } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Full name is required.' } },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: { message: 'A valid email address is required.' } },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must be at least 6 characters long.' } },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username ? username.toLowerCase().trim() : cleanEmail.split('@')[0];

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: { message: 'An account with this email address already exists.' } },
        { status: 409 }
      );
    }

    // Check username uniqueness
    if (cleanUsername) {
      const existingUsername = await prisma.user.findFirst({
        where: { username: cleanUsername }
      });
      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: { message: 'This username is already taken. Please choose another one.' } },
          { status: 409 }
        );
      }
    }

    // Resolve or create default farm
    let farm = await prisma.farm.findFirst({
      orderBy: { created_at: 'asc' }
    });
    if (!farm) {
      farm = await prisma.farm.create({
        data: {
          id: uuidv4(),
          name: 'Bakka Operations',
          code: 'BAKKA-01',
          currency: 'USD',
          timezone: 'Africa/Mogadishu',
          default_language: 'en'
        }
      });
    }

    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    // Security requirement: public registration unconditionally receives STUDENT role
    const roleName = ROLES.STUDENT;

    const user = await prisma.user.create({
      data: {
        id: userId,
        farm_id: farm.id,
        email: cleanEmail,
        username: cleanUsername,
        phone: phone ? phone.trim() : null,
        password_hash: passwordHash,
        full_name: fullName.trim(),
        role_name: roleName,
        is_active: true
      },
      include: { farm: true }
    });

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

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

    const permissions = ROLE_DEFAULT_PERMISSIONS[roleName] || [];

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
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error: any) {
    console.error('[API Register Error]:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Registration failed. Please try again.' } },
      { status: 500 }
    );
  }
}
