import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET() {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const residents = await prisma.user.findMany({
      orderBy: { flatNumber: 'asc' },
    });
    return NextResponse.json(residents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, flatNumber, role } = body;

    if (!name || !phone || !flatNumber || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resident = await prisma.user.create({
      data: { name, phone, flatNumber, role },
    });

    return NextResponse.json(resident);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 });
  }
}