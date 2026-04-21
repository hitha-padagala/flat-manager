'use client';

import { useState, useEffect } from 'react';
import { getMaintenanceRecords, createMaintenance, toggleMaintenancePayment, updateMaintenancePaymentMode, deleteMaintenance } from '@/lib/actions';

interface MaintenanceRecord {
  id: string;
  flatNumber: string;
  month: string;
  isPaid: boolean;
  amount: number;
  paymentMode: 'UPI' | 'CASH' | 'SOCIETY_ACCOUNT' | null;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PaymentsPage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{ flatNumber: string; month: string; amount: number; paymentMode: 'UPI' | 'CASH' | 'SOCIETY_ACCOUNT' }>({ flatNumber: '', month: '', amount: 0, paymentMode: 'UPI' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const data = await getMaintenanceRecords();
    setRecords(data as MaintenanceRecord[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaintenance(formData);
    setFormData({ flatNumber: '', month: '', amount: 0, paymentMode: 'UPI' });
    setShowForm(false);
    loadRecords();
  };

  const handleToggle = async (id: string) => {
    await toggleMaintenancePayment(id);
    loadRecords();
  };

  const handlePaymentModeChange = async (id: string, mode: 'UPI' | 'CASH' | 'SOCIETY_ACCOUNT') => {
    await updateMaintenancePaymentMode(id, mode);
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deleteMaintenance(id);
      loadRecords();
    }
  };

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.flatNumber]) {
      acc[record.flatNumber] = [];
    }
    acc[record.flatNumber].push(record);
    return acc;
  }, {} as Record<string, MaintenanceRecord[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Payments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Payment'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Add Maintenance Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Flat Number</label>
                <input
                  type="text"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as 'UPI' | 'CASH' | 'SOCIETY_ACCOUNT' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="SOCIETY_ACCOUNT">Society Account</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">No payment records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-stone-700">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Flat Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Month</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Payment Mode</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700">
                    <td className="py-3 px-4 dark:text-stone-200">{record.flatNumber}</td>
                    <td className="py-3 px-4 dark:text-stone-200">{record.month}</td>
                    <td className="py-3 px-4 text-right dark:text-stone-200">₹{record.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(record.id)}
                        className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors ${
                          record.isPaid
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                        }`}
                      >
                        {record.isPaid ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={record.paymentMode || 'UPI'}
                        onChange={(e) => handlePaymentModeChange(record.id, e.target.value as 'UPI' | 'CASH' | 'SOCIETY_ACCOUNT')}
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-stone-600 rounded cursor-pointer bg-white dark:bg-stone-700 dark:text-stone-200"
                        disabled={!record.isPaid}
                      >
                        <option value="UPI">UPI</option>
                        <option value="CASH">Cash</option>
                        <option value="SOCIETY_ACCOUNT">Society Account</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
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
