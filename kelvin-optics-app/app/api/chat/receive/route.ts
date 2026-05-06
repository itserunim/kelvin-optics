import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    verifyToken(token);

    const { user, text } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    const deviceUsername = user || 'kelvin';
    const deviceUser = await prisma.user.findUnique({
      where: { username: deviceUsername },
    });

    if (!deviceUser) {
      return NextResponse.json(
        { error: `User '${deviceUsername}' not found. Create the user first.` },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        userId: deviceUser.id,
      },
      include: { user: { select: { username: true } } },
    });

    return NextResponse.json({
      id: message.id,
      user: message.user.username,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      isSelf: false,
    });
  } catch (err) {
    console.error('Failed to store device message:', err);
    return NextResponse.json({ error: 'Invalid token or server error' }, { status: 500 });
  }
}