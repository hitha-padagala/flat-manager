'use client';

import { useState, useEffect, useMemo } from 'react';
import { getDashboardStats } from '@/lib/actions';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface PieDataItem {
  name: string;
  value: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalExpenses: 0,
    totalIncome: 0,
    unpaidFlats: [],
    expensePieChartData: [] as PieDataItem[],
    incomeExpenseData: [] as PieDataItem[],
  });
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [selectedMonth]);

  const loadStats = async () => {
    setLoading(true);
    const data = await getDashboardStats(selectedMonth || undefined);
    setStats(data as any);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Total Residents</h3>
          <p className="text-3xl font-bold mt-2 dark:text-white">{stats.totalResidents}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Total Income</h3>
          <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">₹{stats.totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">₹{stats.totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">{selectedMonth ? 'Monthly Saving' : 'Total Available Balance'}</h3>
          <p className={`text-3xl font-bold mt-2 ${(stats.totalIncome - stats.totalExpenses) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ₹{(stats.totalIncome - stats.totalExpenses).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Paid Maintenance</h3>
          <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">{stats.paidCount}</p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Unpaid Maintenance</h3>
          <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">{stats.unpaidCount}</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white dark:bg-stone-800 p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-stone-300">Filter by Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Income vs Expenses Comparison Pie Chart */}
      {stats.incomeExpenseData.length > 0 && stats.incomeExpenseData[0].value + stats.incomeExpenseData[1].value > 0 && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Income vs Expenses Overview {selectedMonth && `- ${selectedMonth}`}
          </h2>
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-stone-400">Loading...</div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.incomeExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00C49F" /> {/* Green for Income */}
                    <Cell fill="#FF8042" /> {/* Orange/Red for Expenses */}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => `₹${(value as number).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Expense Breakdown Pie Chart */}
      {stats.expensePieChartData.length > 0 && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Expense Breakdown by Category {selectedMonth && `- ${selectedMonth}`}
          </h2>
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-stone-400">Loading...</div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.expensePieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.expensePieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => `₹${(value as number).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Unpaid Flats Table */}
      <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Unpaid Flats</h2>
        {stats.unpaidFlats.length === 0 ? (
          <p className="text-gray-500 dark:text-stone-400">All maintenance payments are up to date!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-stone-700">
                  <th className="text-left py-3 px-4 dark:text-stone-300">Flat Number</th>
                  <th className="text-left py-3 px-4 dark:text-stone-300">Month</th>
                  <th className="text-right py-3 px-4 dark:text-stone-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(stats.unpaidFlats as any[]).map((flat, index) => (
                  <tr key={index} className="border-b dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700">
                    <td className="py-3 px-4 dark:text-stone-200">{flat.flatNumber}</td>
                    <td className="py-3 px-4 dark:text-stone-200">{flat.month}</td>
                    <td className="py-3 px-4 text-right dark:text-stone-200">₹{flat.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
