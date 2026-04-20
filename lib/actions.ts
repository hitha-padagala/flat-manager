'use server';

import { prisma } from './prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
type Role = 'OWNER' | 'TENANT';
type PaymentMode = 'UPI' | 'CASH' | 'SOCIETY_ACCOUNT';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const AUTH_COOKIE_NAME = 'flat_manager_auth';

export async function login(username: string, password: string): Promise<boolean> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return true;
  }
  return false;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect('/login');
}

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (authCookie?.value !== 'authenticated') {
    redirect('/login');
  }
}

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { flatNumber: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function createUser(data: { name: string; phone: string; flatNumber: string; role: Role }) {
  try {
    const user = await prisma.user.create({
      data,
    });
    revalidatePath('/residents');
    revalidatePath('/dashboard');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, data: { name?: string; phone?: string; flatNumber?: string; role?: Role }) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    revalidatePath('/residents');
    revalidatePath('/dashboard');
    return { success: true, user };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/residents');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

export async function getMaintenanceRecords() {
  try {
    return await prisma.maintenance.findMany({
      orderBy: [{ flatNumber: 'asc' }, { month: 'asc' }],
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return [];
  }
}

export async function createMaintenance(data: { flatNumber: string; month: string; amount: number; isPaid?: boolean; paymentMode?: PaymentMode }) {
  try {
    const record = await prisma.maintenance.create({
      data: {
        flatNumber: data.flatNumber,
        month: data.month,
        amount: data.amount,
        isPaid: data.isPaid ?? false,
        paymentMode: data.paymentMode,
      },
    });
    revalidatePath('/payments');
    revalidatePath('/dashboard');
    return { success: true, record };
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return { success: false, error: 'Failed to create maintenance record' };
  }
}

export async function toggleMaintenancePayment(id: string) {
  try {
    const record = await prisma.maintenance.findUnique({ where: { id } });
    if (!record) return { success: false, error: 'Record not found' };

    const updated = await prisma.maintenance.update({
      where: { id },
      data: { isPaid: !record.isPaid },
    });
    revalidatePath('/payments');
    revalidatePath('/dashboard');
    return { success: true, record: updated };
  } catch (error) {
    console.error('Error toggling payment:', error);
    return { success: false, error: 'Failed to toggle payment' };
  }
}

export async function updateMaintenancePaymentMode(id: string, paymentMode: PaymentMode) {
  try {
    const record = await prisma.maintenance.update({
      where: { id },
      data: { paymentMode, isPaid: true },
    });
    revalidatePath('/payments');
    revalidatePath('/dashboard');
    return { success: true, record };
  } catch (error) {
    console.error('Error updating payment mode:', error);
    return { success: false, error: 'Failed to update payment mode' };
  }
}

export async function deleteMaintenance(id: string) {
  try {
    await prisma.maintenance.delete({
      where: { id },
    });
    revalidatePath('/payments');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return { success: false, error: 'Failed to delete record' };
  }
}

export async function getExpenses() {
  try {
    return await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

export async function createExpense(data: { title: string; amount: number; month: string }) {
  try {
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        month: data.month,
      },
    });
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true, expense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, error: 'Failed to create expense' };
  }
}

export async function updateExpense(id: string, data: { title?: string; amount?: number; month?: string }) {
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data,
    });
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true, expense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: 'Failed to update expense' };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}

export async function getDashboardStats() {
  try {
    const [totalResidents, paidCount, unpaidCount, totalExpenses, unpaidFlats] = await Promise.all([
      prisma.user.count(),
      prisma.maintenance.count({ where: { isPaid: true } }),
      prisma.maintenance.count({ where: { isPaid: false } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.maintenance.findMany({
        where: { isPaid: false },
        select: { flatNumber: true, month: true, amount: true },
        orderBy: { flatNumber: 'asc' },
      }),
    ]);

    return {
      totalResidents,
      paidCount,
      unpaidCount,
      totalExpenses: totalExpenses._sum.amount ?? 0,
      unpaidFlats,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalResidents: 0,
      paidCount: 0,
      unpaidCount: 0,
      totalExpenses: 0,
      unpaidFlats: [],
    };
  }
}