import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET() {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payments = await prisma.maintenance.findMany({
      orderBy: { month: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { flatNumber, month, amount, isPaid, paymentMode } = body;

    if (!flatNumber || !month || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payment = await prisma.maintenance.create({
      data: { 
        flatNumber, 
        month,
        amount: parseFloat(amount),
        isPaid: isPaid || false,
        paymentMode,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}