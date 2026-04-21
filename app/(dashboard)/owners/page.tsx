'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getCurrentUser } from '@/lib/actions';
import { Role } from '@prisma/client';

type ResidentType = Role;

interface User {
  id: string;
  name: string;
  phone: string;
  flatNumber: string;
  residentType: ResidentType;
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', flatNumber: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadOwners();
    checkAdmin();
  }, []);

  const loadOwners = async () => {
    setLoading(true);
    const usersData = await getUsers();
    const ownersList = (usersData as User[]).filter(user => user.residentType === 'OWNER');
    setOwners(ownersList);
    setLoading(false);
  };

  const checkAdmin = async () => {
    const user = await getCurrentUser();
    setIsAdmin(user?.role === 'ADMIN');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOwner) {
      const updateData: { name: string; phone: string; flatNumber: string; password?: string } = {
        name: formData.name,
        phone: formData.phone,
        flatNumber: formData.flatNumber,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateUser(editingOwner.id, updateData);
    } else {
      await createUser({
        name: formData.name,
        phone: formData.phone,
        flatNumber: formData.flatNumber,
        residentType: 'OWNER',
        password: formData.password,
      });
    }
    setFormData({ name: '', phone: '', flatNumber: '', password: '' });
    setShowForm(false);
    setEditingOwner(null);
    loadOwners();
  };

  const handleEdit = (owner: User) => {
    setEditingOwner(owner);
    setFormData({ name: owner.name, phone: owner.phone, flatNumber: owner.flatNumber, password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this owner?')) {
      await deleteUser(id);
      loadOwners();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', flatNumber: '', password: '' });
    setShowForm(false);
    setEditingOwner(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Owners</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Owner'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {editingOwner ? 'Edit Owner' : 'Add New Owner'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">
                  Password {editingOwner ? '(leave blank to keep current)' : ''}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-stone-700 dark:text-white"
                  required={!editingOwner}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              {editingOwner ? 'Update' : 'Add'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">Loading...</div>
        ) : owners.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-stone-400">No owners found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-stone-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Flat Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Phone</th>
                {isAdmin && <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-stone-300">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-t dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700">
                  <td className="py-3 px-4 dark:text-stone-200">{owner.flatNumber}</td>
                  <td className="py-3 px-4 dark:text-stone-200">{owner.name}</td>
                  <td className="py-3 px-4 dark:text-stone-200">{owner.phone}</td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(owner)}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(owner.id)}
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
