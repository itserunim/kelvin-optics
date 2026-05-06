import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Password strength validator
function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  // Username format validation
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.' },
      { status: 400 }
    );
  }

  // Strong password check
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: 'Username already taken. Please choose another.' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  const token = signToken(user.id, user.username);
  return NextResponse.json({ token, username: user.username });
}