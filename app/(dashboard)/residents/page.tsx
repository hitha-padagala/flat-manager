'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getMaintenanceRecords } from '@/lib/actions';

type Role = 'OWNER' | 'TENANT';

interface User {
  id: string;
  name: string;
  phone: string;
  flatNumber: string;
  role: Role;
}

interface Maintenance {
  id: string;
  flatNumber: string;
  month: string;
  isPaid: boolean;
  amount: number;
}

export default function ResidentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', flatNumber: '', role: 'OWNER' as Role });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersData, maintenanceData] = await Promise.all([
      getUsers(),
      getMaintenanceRecords()
    ]);
    setUsers(usersData as User[]);
    setMaintenance(maintenanceData as Maintenance[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await createUser(formData);
    }
    setFormData({ name: '', phone: '', flatNumber: '', role: 'OWNER' });
    setShowForm(false);
    setEditingUser(null);
    loadData();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, phone: user.phone, flatNumber: user.flatNumber, role: user.role });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      await deleteUser(id);
      loadData();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', flatNumber: '', role: 'OWNER' });
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Residents</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Resident'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {editingUser ? 'Edit Resident' : 'Add New Resident'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  required
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                >
                  <option value="OWNER">Owner</option>
                  <option value="TENANT">Tenant</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              {editingUser ? 'Update' : 'Add'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">No residents found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-stone-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Flat Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Maintenance</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const maintenanceRecords = maintenance.filter(m => m.flatNumber === user.flatNumber);
                const hasUnpaid = maintenanceRecords.some(m => !m.isPaid);
                const allPaid = maintenanceRecords.length > 0 && maintenanceRecords.every(m => m.isPaid);
                return (
                <tr key={user.id} className="border-t dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700">
                  <td className="py-3 px-4 dark:text-stone-200">{user.flatNumber}</td>
                  <td className="py-3 px-4 dark:text-stone-200">{user.name}</td>
                  <td className="py-3 px-4 dark:text-stone-200">{user.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${user.role === 'OWNER' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {maintenanceRecords.length === 0 ? (
                      <span className="text-gray-400 text-sm dark:text-stone-500">No records</span>
                    ) : allPaid ? (
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</span>
                    ) : hasUnpaid ? (
                      <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Unpaid</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
