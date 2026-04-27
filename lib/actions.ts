'use server';

import { prisma } from './prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { Role, UserRole, PaymentMode } from '@prisma/client';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FlatMgr@2026';
const AUTH_COOKIE_NAME = 'flat_manager_auth';
const USER_ID_COOKIE_NAME = 'flat_manager_user_id';

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
    cookieStore.set(USER_ID_COOKIE_NAME, 'admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return true;
  }

  const user = await prisma.user.findUnique({
    where: { phone: username },
  });

  if (!user || !user.password) {
    return false;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
  cookieStore.set(USER_ID_COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(USER_ID_COOKIE_NAME);
  redirect('/login');
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === 'authenticated';
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_COOKIE_NAME)?.value;
  if (!userId) return null;

    if (userId === 'admin') {
      return { id: 'admin', role: UserRole.ADMIN, name: 'Admin' };
    }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true },
  });

  return user;
}

export async function requireAdmin(): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Forbidden');
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

export async function createUser(data: { name: string; phone: string; flatNumber: string; residentType: Role; password: string; isManager?: boolean }) {
  await requireAdmin();
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        flatNumber: data.flatNumber,
        residentType: data.residentType,
        role: UserRole.USER,
        password: hashedPassword,
        isManager: data.isManager ?? false,
      },
    });
    revalidatePath('/residents');
    revalidatePath('/owners');
    revalidatePath('/members');
    revalidatePath('/dashboard');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, data: { name?: string; phone?: string; flatNumber?: string; residentType?: Role; password?: string; isManager?: boolean }) {
  await requireAdmin();
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.flatNumber !== undefined) updateData.flatNumber = data.flatNumber;
    if (data.residentType !== undefined) updateData.residentType = data.residentType;
    if (data.isManager !== undefined) updateData.isManager = data.isManager;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/residents');
    revalidatePath('/owners');
    revalidatePath('/members');
    revalidatePath('/dashboard');
    return { success: true, user };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  await requireAdmin();
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/residents');
    revalidatePath('/owners');
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

export async function createMaintenance(data: { flatNumber: string; month: string; amount: number; isPaid?: boolean; paymentMode?: PaymentMode; paidDate?: Date | null }) {
  await requireAdmin();
  try {
    const record = await prisma.maintenance.create({
      data: {
        flatNumber: data.flatNumber,
        month: data.month,
        amount: data.amount,
        isPaid: data.isPaid ?? false,
        paymentMode: data.paymentMode,
        paidDate: data.paidDate ?? null,
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
  await requireAdmin();
  try {
    const record = await prisma.maintenance.findUnique({ where: { id } });
    if (!record) return { success: false, error: 'Record not found' };

    const newIsPaid = !record.isPaid;
    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        isPaid: newIsPaid,
        paidDate: newIsPaid ? new Date() : null,
      },
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
  await requireAdmin();
  try {
    const record = await prisma.maintenance.update({
      where: { id },
      data: { paymentMode, isPaid: true, paidDate: new Date() },
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
  await requireAdmin();
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

export async function createExpense(data: { title: string; amount: number; month: string; note?: string }) {
  await requireAdmin();
  try {
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        month: data.month,
        note: data.note || "",
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

export async function updateExpense(id: string, data: { title?: string; amount?: number; month?: string; note?: string }) {
  await requireAdmin();
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
  await requireAdmin();
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

export async function getDashboardStats(selectedMonth?: string) {
  try {
    const expenseWhereClause = selectedMonth ? { month: selectedMonth } : {};
    const maintenanceWhereClause = selectedMonth ? { month: selectedMonth, isPaid: true } : { isPaid: true };
    
    const [totalFlatsResult, totalResidents, paidCount, unpaidCount, totalExpenses, unpaidFlats, expenseBreakdown, maintenanceIncome, expectedMaintenance, pendingMaintenance] = await Promise.all([
      prisma.user.findMany({ where: { flatNumber: { not: '' } }, select: { flatNumber: true }, distinct: ['flatNumber'] }),
      prisma.user.count(),
      prisma.maintenance.count({ where: { isPaid: true } }),
      prisma.maintenance.count({ where: { isPaid: false } }),
      prisma.expense.aggregate({ where: expenseWhereClause, _sum: { amount: true } }),
      prisma.maintenance.findMany({
        where: { isPaid: false },
        select: { flatNumber: true, month: true, amount: true },
        orderBy: { flatNumber: 'asc' },
      }),
      prisma.expense.findMany({
        where: expenseWhereClause,
        select: { title: true, amount: true },
      }),
      prisma.maintenance.aggregate({ where: maintenanceWhereClause, _sum: { amount: true } }),
      prisma.maintenance.aggregate({ where: selectedMonth ? { month: selectedMonth } : {}, _sum: { amount: true } }),
      prisma.maintenance.aggregate({ where: { isPaid: false }, _sum: { amount: true } }),
    ]);
    const totalFlats = totalFlatsResult.length;

    // Group expenses by title (category)
    const categoryTotals = expenseBreakdown.reduce((acc, exp) => {
      acc[exp.title] = (acc[exp.title] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const expensePieChartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));

    // Income vs Expenses comparison data
    const incomeExpenseData = [
      { name: 'Total Income', value: maintenanceIncome._sum.amount ?? 0 },
      { name: 'Total Expenses', value: totalExpenses._sum.amount ?? 0 },
    ];

    return {
      totalFlats,
      totalResidents,
      paidCount,
      unpaidCount,
      totalExpenses: totalExpenses._sum.amount ?? 0,
      totalIncome: maintenanceIncome._sum.amount ?? 0,
      unpaidFlats,
      expensePieChartData,
      incomeExpenseData,
      expectedMaintenance: expectedMaintenance._sum.amount ?? 0,
      pendingMaintenance: pendingMaintenance._sum.amount ?? 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalFlats: 0,
      totalResidents: 0,
      paidCount: 0,
      unpaidCount: 0,
      totalExpenses: 0,
      totalIncome: 0,
      unpaidFlats: [],
      expensePieChartData: [],
      incomeExpenseData: [],
      expectedMaintenance: 0,
      pendingMaintenance: 0,
    };
  }
}
