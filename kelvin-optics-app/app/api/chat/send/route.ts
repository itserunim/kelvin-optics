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
    const { userId, username } = verifyToken(token);

    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        userId,
      },
      include: { user: { select: { username: true } } },
    });

    return NextResponse.json({
      id: message.id,
      user: message.user.username,
      text: message.text,
      createdAt: message.createdAt,
      isSelf: true,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}