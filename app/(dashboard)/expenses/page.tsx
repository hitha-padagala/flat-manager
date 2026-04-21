'use client';

import { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense, getCurrentUser } from '@/lib/actions';

interface Expense {
  id: string;
  title: string;
  amount: number;
  month: string;
  note: string;
  date: Date;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const expenseTypes = [
  { value: 'Watchman Salary', label: 'Watchman Salary' },
  { value: 'Water Bill', label: 'Water Bill' },
  { value: 'Miscellaneous', label: 'Miscellaneous' },
  { value: 'Others', label: 'Others' }
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({ title: '', amount: 0, month: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadExpenses();
    checkAdmin();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    const data = await getExpenses();
    setExpenses(data as Expense[]);
    setLoading(false);
  };

  const checkAdmin = async () => {
    const user = await getCurrentUser();
    setIsAdmin(user?.role === 'ADMIN');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        title: formData.title,
        amount: formData.amount,
        month: formData.month,
        note: formData.note
      });
    } else {
      await createExpense({
        title: formData.title,
        amount: formData.amount,
        month: formData.month,
        note: formData.note
      });
    }
    setFormData({ title: '', amount: 0, month: '', note: '' });
    setShowForm(false);
    setEditingExpense(null);
    loadExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({ title: expense.title, amount: expense.amount, month: expense.month, note: expense.note || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
      loadExpenses();
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', amount: 0, month: '', note: '' });
    setShowForm(false);
    setEditingExpense(null);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Expenses</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Expense'}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 dark:text-stone-400 text-sm font-medium">Total Expenses</h3>
            <p className="text-3xl font-bold mt-1 dark:text-white">₹{totalExpenses.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {showForm && isAdmin && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Type</label>
                <select
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  required
                >
                  <option value="">Select Type</option>
                  {expenseTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  required
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  placeholder="Add details (for Others)"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              {editingExpense ? 'Update' : 'Add'}
            </button>
            {editingExpense && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors ml-2"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">No expenses found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-stone-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Month</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Note</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Amount</th>
                {isAdmin && <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700">
                  <td className="py-3 px-4 dark:text-stone-200">{formatDate(expense.date)}</td>
                  <td className="py-3 px-4 dark:text-stone-200">{expense.month}</td>
                  <td className="py-3 px-4 dark:text-stone-200">{expense.title}</td>
                  <td className="py-3 px-4 dark:text-stone-200 text-sm text-gray-500">{expense.note || '-'}</td>
                  <td className="py-3 px-4 text-right dark:text-stone-200">₹{expense.amount.toLocaleString()}</td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
