import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const resident = await prisma.user.findUnique({ where: { id } });
    
    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }
    
    return NextResponse.json(resident);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resident' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, flatNumber, role } = body;

    const resident = await prisma.user.update({
      where: { id },
      data: { name, phone, flatNumber, role },
    });

    return NextResponse.json(resident);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
}