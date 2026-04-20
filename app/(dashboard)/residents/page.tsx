'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getMaintenanceRecords } from '@/lib/actions';
import { Role } from '@/generated/prisma/enums';

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
        <h1 className="text-3xl font-bold">Residents</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Resident'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingUser ? 'Edit Resident' : 'Add New Resident'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flat Number</label>
                <input
                  type="text"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No residents found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Flat Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Maintenance</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const maintenanceRecords = maintenance.filter(m => m.flatNumber === user.flatNumber);
                const hasUnpaid = maintenanceRecords.some(m => !m.isPaid);
                const allPaid = maintenanceRecords.length > 0 && maintenanceRecords.every(m => m.isPaid);
                return (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{user.flatNumber}</td>
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${user.role === 'OWNER' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {maintenanceRecords.length === 0 ? (
                      <span className="text-gray-400 text-sm">No records</span>
                    ) : allPaid ? (
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">Paid</span>
                    ) : hasUnpaid ? (
                      <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-800">Unpaid</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">Paid</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
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
