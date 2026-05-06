import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId } = verifyToken(token);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const messages = await prisma.message.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    });

    // Return oldest first
    const formatted = messages.reverse().map(msg => ({
      id: msg.id,
      user: msg.user.username,
      text: msg.text,
      createdAt: msg.createdAt,
      isSelf: msg.userId === userId,
    }));

    return NextResponse.json({ messages: formatted });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}