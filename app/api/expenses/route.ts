import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET() {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isValid = await validateApiKey();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, amount, month } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: { 
        title, 
        amount: parseFloat(amount),
        month: month || '',
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}